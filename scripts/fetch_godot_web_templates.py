#!/usr/bin/env python3
# Descarga solo las plantillas de exportación web de Godot, leyendo el .tpz
# (un zip de ~1,2 GB) por HTTP Range en vez de bajarlo entero:
#   python3 scripts/fetch_godot_web_templates.py 4.7.2

import io
import os
import sys
import urllib.request
import zipfile
from pathlib import Path

WANTED = {"web_nothreads_release.zip", "web_nothreads_debug.zip", "version.txt"}


class HttpRangeFile(io.RawIOBase):
    def __init__(self, url):
        head = urllib.request.urlopen(urllib.request.Request(url, method="HEAD"))
        self.url = head.url
        self.size = int(head.headers["Content-Length"])
        self.pos = 0

    def seekable(self):
        return True

    def readable(self):
        return True

    def tell(self):
        return self.pos

    def seek(self, offset, whence=io.SEEK_SET):
        base = {io.SEEK_SET: 0, io.SEEK_CUR: self.pos, io.SEEK_END: self.size}[whence]
        self.pos = base + offset
        return self.pos

    def readinto(self, buf):
        if self.pos >= self.size or len(buf) == 0:
            return 0
        end = min(self.pos + len(buf), self.size) - 1
        req = urllib.request.Request(self.url, headers={"Range": f"bytes={self.pos}-{end}"})
        data = urllib.request.urlopen(req).read()
        buf[: len(data)] = data
        self.pos += len(data)
        return len(data)


def main():
    version = sys.argv[1]
    url = (
        f"https://github.com/godotengine/godot/releases/download/{version}-stable/"
        f"Godot_v{version}-stable_export_templates.tpz"
    )
    out_dir = Path.home() / f".local/share/godot/export_templates/{version}.stable"
    out_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(io.BufferedReader(HttpRangeFile(url), 1 << 20)) as z:
        for info in z.infolist():
            name = os.path.basename(info.filename)
            if name in WANTED:
                with z.open(info) as src, open(out_dir / name, "wb") as dst:
                    while chunk := src.read(1 << 20):
                        dst.write(chunk)
                print(name, info.file_size)


if __name__ == "__main__":
    main()

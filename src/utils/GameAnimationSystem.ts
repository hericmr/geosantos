/**
 * Sistema de animações unificado para o jogo GeoSantos
 * Coordena todas as animações e evita conflitos de timing
 */

import { gameTimerManager } from './GameTimerManager';

export interface Animation {
  id: string;
  type: 'sprite' | 'visual' | 'ui';
  frames?: number;
  frameDelay?: number;
  delay?: number;
  duration?: number;
  onComplete?: () => void;
  onStart?: () => void;
}

export class GameAnimationSystem {
  private animations: Map<string, Animation> = new Map();
  private animationQueue: Animation[] = [];
  private currentAnimation: Animation | null = null;
  private isPlaying: boolean = false;
  private timerManager = gameTimerManager; // Usar instância singleton

  constructor() {
    this.setupAnimationTypes();
  }

  private setupAnimationTypes(): void {
    const mobileConfig = this.timerManager.getMobileOptimizedConfig();

    // Definir tipos de animação com configurações otimizadas
    this.animations.set('sprite_click', {
      id: 'sprite_click',
      type: 'sprite',
      frames: mobileConfig.spriteFrames,
      frameDelay: mobileConfig.frameDelay,
      onComplete: () => this.triggerNextAnimation()
    });

    this.animations.set('bandeira_correta', {
      id: 'bandeira_correta',
      type: 'sprite',
      frames: mobileConfig.spriteFrames,
      frameDelay: mobileConfig.frameDelay,
      onComplete: () => this.triggerNextAnimation()
    });

    this.animations.set('distance_circle', {
      id: 'distance_circle',
      type: 'visual',
      delay: mobileConfig.distanceCircleDelay,
      duration: 2000,
      onComplete: () => this.triggerNextAnimation()
    });

    this.animations.set('feedback_panel', {
      id: 'feedback_panel',
      type: 'ui',
      delay: mobileConfig.feedbackDelay,
      duration: 3000,
      onComplete: () => this.triggerNextAnimation()
    });
  }

  /**
   * Reproduz uma sequência de animações
   */
  playAnimationSequence(sequence: string[]): void {
    console.log('[GameAnimationSystem] Iniciando sequência:', sequence);
    
    // Limpar qualquer animação em andamento
    this.stopCurrentAnimation();
    
    // Configurar fila de animações
    this.animationQueue = sequence
      .map(id => this.animations.get(id))
      .filter(Boolean) as Animation[];
    
    if (this.animationQueue.length > 0) {
      this.playNextAnimation();
    }
  }

  /**
   * Reproduz a próxima animação na fila
   */
  private playNextAnimation(): void {
    if (this.animationQueue.length === 0) {
      this.isPlaying = false;
      this.currentAnimation = null;
      console.log('[GameAnimationSystem] Sequência de animações concluída');
      return;
    }

    const animation = this.animationQueue.shift()!;
    this.currentAnimation = animation;
    this.isPlaying = true;

    console.log(`[GameAnimationSystem] Reproduzindo animação: ${animation.id}`);

    if (animation.onStart) {
      animation.onStart();
    }

    if (animation.type === 'sprite') {
      this.playSpriteAnimation(animation);
    } else if (animation.type === 'visual') {
      this.playVisualAnimation(animation);
    } else if (animation.type === 'ui') {
      this.playUIAnimation(animation);
    }
  }

  /**
   * Reproduz animação de sprite
   */
  private playSpriteAnimation(animation: Animation): void {
    if (!animation.frames || !animation.frameDelay) return;

    let currentFrame = 1;
    const totalFrames = animation.frames;

    const animate = () => {
      if (currentFrame <= totalFrames && this.isPlaying) {
        // Atualizar frame atual
        this.updateSpriteFrame(animation.id, currentFrame);
        currentFrame++;

        if (currentFrame <= totalFrames) {
          // Continuar animação
          this.timerManager.scheduleTimer(
            `sprite_${animation.id}_${currentFrame}`,
            animation.frameDelay!,
            animate
          );
        } else {
          // Animação terminou
          console.log(`[GameAnimationSystem] Sprite ${animation.id} concluído`);
          if (animation.onComplete) {
            animation.onComplete();
          }
        }
      }
    };

    // Iniciar animação
    animate();
  }

  /**
   * Reproduz animação visual
   */
  private playVisualAnimation(animation: Animation): void {
    if (!animation.delay) return;

    this.timerManager.scheduleTimer(
      `visual_${animation.id}`,
      animation.delay,
      () => {
        console.log(`[GameAnimationSystem] Visual ${animation.id} concluído`);
        if (animation.onComplete) {
          animation.onComplete();
        }
      }
    );
  }

  /**
   * Reproduz animação de UI
   */
  private playUIAnimation(animation: Animation): void {
    if (!animation.delay) return;

    this.timerManager.scheduleTimer(
      `ui_${animation.id}`,
      animation.delay,
      () => {
        console.log(`[GameAnimationSystem] UI ${animation.id} concluído`);
        if (animation.onComplete) {
          animation.onComplete();
        }
      }
    );
  }

  /**
   * Atualiza o frame atual de um sprite
   */
  private updateSpriteFrame(animationId: string, frame: number): void {
    // Emitir evento para o componente de sprite
    const event = new CustomEvent('spriteFrameUpdate', {
      detail: { animationId, frame }
    });
    window.dispatchEvent(event);
  }

  /**
   * Dispara a próxima animação na fila
   */
  private triggerNextAnimation(): void {
    if (this.animationQueue.length > 0) {
      this.playNextAnimation();
    } else {
      this.isPlaying = false;
      this.currentAnimation = null;
    }
  }

  /**
   * Para a animação atual
   */
  stopCurrentAnimation(): void {
    if (this.currentAnimation) {
      this.isPlaying = false;
      this.currentAnimation = null;
    }
    
    // Limpar todos os timers relacionados
    this.timerManager.clearAll();
  }

  /**
   * Verifica se está reproduzindo alguma animação
   */
  isAnimating(): boolean {
    return this.isPlaying;
  }

  /**
   * Retorna a animação atual
   */
  getCurrentAnimation(): Animation | null {
    return this.currentAnimation;
  }

  /**
   * Limpa todas as animações e timers
   */
  cleanup(): void {
    this.stopCurrentAnimation();
    this.animationQueue = [];
    this.timerManager.clearAll();
  }
} 
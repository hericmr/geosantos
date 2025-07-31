import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileDisplay } from '../MobileDisplay';

// Mock dos componentes dependentes
jest.mock('../FamousPlacesWiki', () => ({
  FamousPlacesWiki: () => <div data-testid="famous-places-wiki">Famous Places Wiki</div>
}));

describe('MobileDisplay', () => {
  beforeEach(() => {
    // Mock do import.meta.env.BASE_URL
    Object.defineProperty(import.meta, 'env', {
      value: { BASE_URL: '' },
      writable: true
    });
  });

  it('renders the main mobile display interface', () => {
    render(<MobileDisplay />);
    
    // Verifica se o título principal está presente
    expect(screen.getByText('GEOSANTOS')).toBeInTheDocument();
    expect(screen.getByText('Jogo de Geografia')).toBeInTheDocument();
    
    // Verifica se a mensagem de desenvolvimento está presente
    expect(screen.getByText('Em Desenvolvimento')).toBeInTheDocument();
    expect(screen.getByText('Geosantos é um jogo que ainda está em construção.')).toBeInTheDocument();
    expect(screen.getByText('Atualmente só pode ser jogado em computadores.')).toBeInTheDocument();
    expect(screen.getByText('Acesse em um computador para jogar')).toBeInTheDocument();
    expect(screen.getByText('Obrigado pela sua visita!')).toBeInTheDocument();
    
    // Verifica se o botão de lugares famosos está presente
    expect(screen.getByText('Lugares Famosos')).toBeInTheDocument();
  });

  it('shows close button when onClose prop is provided', () => {
    const mockOnClose = jest.fn();
    render(<MobileDisplay onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when onClose prop is not provided', () => {
    render(<MobileDisplay />);
    
    const closeButton = screen.queryByRole('button', { name: /close/i });
    expect(closeButton).not.toBeInTheDocument();
  });

  it('shows famous places wiki when clicking on Lugares Famosos button', () => {
    render(<MobileDisplay />);
    
    const famousPlacesButton = screen.getByText('Lugares Famosos');
    fireEvent.click(famousPlacesButton);
    
    // Verifica se o componente FamousPlacesWiki é renderizado
    expect(screen.getByTestId('famous-places-wiki')).toBeInTheDocument();
    
    // Verifica se o header do famous places está presente
    expect(screen.getByText('Lugares Famosos')).toBeInTheDocument();
  });

  it('returns to main display when closing famous places', () => {
    render(<MobileDisplay />);
    
    // Abre o famous places
    const famousPlacesButton = screen.getByText('Lugares Famosos');
    fireEvent.click(famousPlacesButton);
    
    // Verifica se está no famous places
    expect(screen.getByTestId('famous-places-wiki')).toBeInTheDocument();
    
    // Fecha o famous places
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Verifica se voltou para o display principal
    expect(screen.getByText('GEOSANTOS')).toBeInTheDocument();
    expect(screen.queryByTestId('famous-places-wiki')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<MobileDisplay />);
    
    // Verifica se os botões têm roles apropriados
    const famousPlacesButton = screen.getByRole('button', { name: /lugares famosos/i });
    expect(famousPlacesButton).toBeInTheDocument();
  });

  it('displays the construction icon', () => {
    render(<MobileDisplay />);
    
    // Verifica se o ícone de construção está presente
    expect(screen.getByTestId('construction-icon')).toBeInTheDocument();
  });


}); 
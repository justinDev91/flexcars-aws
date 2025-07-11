import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PaymentModal } from '../payment-modal';

// Mock Stripe
const mockStripe = {
  confirmPayment: jest.fn(),
};

const mockElements = {
  getElement: jest.fn(),
  submit: jest.fn(),
};

// Create mock functions that can be reassigned
const mockUseStripe = jest.fn<typeof mockStripe | null, []>();
const mockUseElements = jest.fn<typeof mockElements | null, []>();

jest.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => mockUseStripe(),
  useElements: () => mockUseElements(),
  PaymentElement: ({ options }: { options?: Record<string, unknown> }) => (
    <div data-testid="payment-element">
      Mock Payment Element
      <div data-testid="payment-options">{JSON.stringify(options)}</div>
    </div>
  ),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  amount: 20000, // 200€ en centimes
  invoiceId: 'invoice-123',
  onSuccess: jest.fn(),
  onError: jest.fn(),
};

describe('PaymentModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Initialize mocks with default values
    mockUseStripe.mockReturnValue(mockStripe);
    mockUseElements.mockReturnValue(mockElements);
  });

  it('should render payment modal when open', () => {
    render(<PaymentModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Paiement sécurisé')).toBeInTheDocument();
    expect(screen.getByText('200,00 €')).toBeInTheDocument();
    expect(screen.getByText('#oice-123')).toBeInTheDocument(); // Invoice number (last 8 chars)
  });

  it('should not render when closed', () => {
    render(<PaymentModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display formatted amount correctly', () => {
    render(<PaymentModal {...defaultProps} amount={15050} />); // 150,50€

    expect(screen.getByText('150,50 €')).toBeInTheDocument();
  });

  it('should calculate and display tax amount', () => {
    render(<PaymentModal {...defaultProps} amount={12000} />); // 120€

    // Tax = (120 * 0.2 / 1.2) = 20€
    expect(screen.getByText(/20\.00.*€.*de TVA/)).toBeInTheDocument();
  });

  it('should handle successful payment', async () => {
    const user = userEvent.setup();
    mockStripe.confirmPayment.mockResolvedValue({
      paymentIntent: { status: 'succeeded' },
      error: undefined,
    });

    render(<PaymentModal {...defaultProps} />);

    const payButton = screen.getByRole('button', { name: /Payer.*200,00.*TTC/ });
    await user.click(payButton);

    await waitFor(() => {
      expect(mockStripe.confirmPayment).toHaveBeenCalledWith({
        elements: mockElements,
        confirmParams: {
          return_url: expect.stringContaining('/dashboard/reservations?payment=success'),
        },
        redirect: 'if_required',
      });
    });

    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should handle payment error', async () => {
    const user = userEvent.setup();
    const mockError = { message: 'Your card was declined.' };
    mockStripe.confirmPayment.mockResolvedValue({
      error: mockError,
      paymentIntent: undefined,
    });

    render(<PaymentModal {...defaultProps} />);

    const payButton = screen.getByRole('button', { name: /Payer.*200,00.*TTC/ });
    await user.click(payButton);

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalled();
    });
  });

  it('should disable pay button when Stripe is not loaded', () => {
    // Mock Stripe not loaded
    mockUseStripe.mockReturnValue(null);

    render(<PaymentModal {...defaultProps} />);

    const payButton = screen.getByRole('button', { name: /Payer.*200,00.*TTC/ });
    expect(payButton).toBeDisabled();

    // Restore mock
    mockUseStripe.mockReturnValue(mockStripe);
  });

  it('should disable pay button when Elements is not loaded', () => {
    // Mock Elements not loaded
    mockUseElements.mockReturnValue(null);

    render(<PaymentModal {...defaultProps} />);

    const payButton = screen.getByRole('button', { name: /Payer.*200,00.*TTC/ });
    expect(payButton).toBeDisabled();

    // Restore mock
    mockUseElements.mockReturnValue(mockElements);
  });

  it('should show processing state during payment', async () => {
    const user = userEvent.setup();
    let resolvePayment: (value: { paymentIntent?: { status: string } }) => void = () => {};
    const paymentPromise = new Promise((resolve) => {
      resolvePayment = resolve;
    });
    mockStripe.confirmPayment.mockReturnValue(paymentPromise);

    render(<PaymentModal {...defaultProps} />);

    const payButton = screen.getByRole('button', { name: /Payer.*200,00.*TTC/ });
    await user.click(payButton);

    // Should show processing state
    expect(screen.getByText('Traitement...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Resolve the payment
    resolvePayment({ paymentIntent: { status: 'succeeded' } });
  });

  it('should handle cancel button', async () => {
    const user = userEvent.setup();
    render(<PaymentModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Annuler/ });
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should prevent multiple simultaneous payment attempts', async () => {
    const user = userEvent.setup();
    let resolvePayment: (value: { paymentIntent?: { status: string } }) => void = () => {};
    const paymentPromise = new Promise((resolve) => {
      resolvePayment = resolve;
    });
    mockStripe.confirmPayment.mockReturnValue(paymentPromise);

    render(<PaymentModal {...defaultProps} />);

    const payButton = screen.getByRole('button', { name: /Payer.*200,00.*TTC/ });
    
    // Click multiple times quickly
    await user.click(payButton);
    await user.click(payButton);
    await user.click(payButton);

    // confirmPayment should only be called once
    expect(mockStripe.confirmPayment).toHaveBeenCalledTimes(1);

    // Resolve the payment
    resolvePayment({ paymentIntent: { status: 'succeeded' } });
  });

  it('should display correct payment element options', () => {
    render(<PaymentModal {...defaultProps} />);

    const paymentOptionsElement = screen.getByTestId('payment-options');
    const options = JSON.parse(paymentOptionsElement.textContent || '{}');

    expect(options).toEqual({
      layout: {
        type: 'tabs',
        defaultCollapsed: false,
      },
      paymentMethodOrder: ['card'],
      fields: {
        billingDetails: 'auto',
      },
      terms: {
        card: 'never',
      },
      wallets: {
        applePay: 'never',
        googlePay: 'never',
      },
    });
  });

  it('should handle different payment types', () => {
    render(<PaymentModal {...defaultProps} paymentType="late_fees" />);

    // Component should still render normally regardless of payment type
    expect(screen.getByText('Paiement sécurisé')).toBeInTheDocument();
  });

  describe('Error handling', () => {
    it('should handle payment processing error', async () => {
      const user = userEvent.setup();
      mockStripe.confirmPayment.mockRejectedValue(new Error('Network error'));

      render(<PaymentModal {...defaultProps} />);

      const payButton = screen.getByRole('button', { name: /Payer.*200,00.*TTC/ });
      await user.click(payButton);

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalled();
      });
    });

    it('should show retry option on error', async () => {
      const user = userEvent.setup();
      mockStripe.confirmPayment.mockResolvedValue({
        error: { message: 'Your card was declined.' },
      });

      render(<PaymentModal {...defaultProps} />);

      const payButton = screen.getByRole('button', { name: /Payer.*200,00.*TTC/ });
      await user.click(payButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Réessayer/ })).toBeInTheDocument();
      });
    });
  });
}); 
// Academix - Button Component
import { Button as BootstrapButton, Spinner } from 'react-bootstrap';

/**
 * Button - Reusable button component with loading state
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          <span>Loading...</span>
        </>
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && <span className="me-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ms-2">{icon}</span>}
      </>
    );
  };

  return (
    <BootstrapButton
      variant={variant}
      size={size}
      type={type}
      disabled={disabled || isLoading}
      className={className}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
    </BootstrapButton>
  );
};

export default Button;

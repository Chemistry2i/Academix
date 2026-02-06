// Academix - Loading Spinner Component
import { ClipLoader, BeatLoader, PulseLoader } from 'react-spinners';

/**
 * LoadingSpinner - Reusable loading spinner component
 * 
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} color - Spinner color
 * @param {string} text - Loading text
 * @param {string} variant - 'clip' | 'beat' | 'pulse'
 * @param {boolean} fullScreen - Show full screen overlay
 */
const LoadingSpinner = ({
  size = 'md',
  color = '#0d6efd',
  text = '',
  variant = 'clip',
  fullScreen = false,
}) => {
  const sizes = {
    sm: 20,
    md: 35,
    lg: 50,
  };

  const spinnerSize = sizes[size] || sizes.md;

  const renderSpinner = () => {
    switch (variant) {
      case 'beat':
        return <BeatLoader color={color} size={spinnerSize / 3} />;
      case 'pulse':
        return <PulseLoader color={color} size={spinnerSize / 3} />;
      default:
        return <ClipLoader color={color} size={spinnerSize} />;
    }
  };

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className="text-center">
          {renderSpinner()}
          {text && <p className="mt-3 text-muted">{text}</p>}
        </div>
        <style>{`
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-3">
      {renderSpinner()}
      {text && <p className="mt-2 mb-0 text-muted small">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

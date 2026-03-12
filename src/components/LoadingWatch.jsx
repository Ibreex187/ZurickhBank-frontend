import { Watch } from 'react-loader-spinner';
import PropTypes from 'prop-types';

const LoadingWatch = ({
  label = 'Loading...',
  height = 64,
  width = 64,
  radius = 40,
  color = 'var(--accent-dark, #94A3B8)',
  minHeight = '120px',
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight,
      flexDirection: 'column',
      gap: '12px',
    }}
  >
    <Watch
      visible={true}
      height={String(height)}
      width={String(width)}
      radius={String(radius)}
      color={color}
      ariaLabel="watch-loading"
      wrapperStyle={{}}
      wrapperClass=""
    />
    {label && <span style={{ color: 'var(--text-muted, #52525B)' }}>{label}</span>}
  </div>
);

LoadingWatch.propTypes = {
  label: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  radius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string,
  minHeight: PropTypes.string,
};

export default LoadingWatch;

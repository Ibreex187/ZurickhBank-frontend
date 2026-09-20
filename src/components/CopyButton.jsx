import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { Check2, Clipboard } from 'react-bootstrap-icons';

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Older browsers and non-secure contexts
  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.style.position = 'fixed';
  helper.style.opacity = '0';
  document.body.appendChild(helper);
  helper.select();

  try {
    if (!document.execCommand('copy')) {
      throw new Error('Copy command was rejected');
    }
  } finally {
    document.body.removeChild(helper);
  }
};

const CopyButton = ({ value, label = 'Copy', ariaLabel, className = '', variant = 'link' }) => {
  const [status, setStatus] = useState('idle'); // idle | copied | failed
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await copyToClipboard(String(value ?? ''));
      setStatus('copied');
    } catch {
      setStatus('failed');
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus('idle'), 2000);
  };

  const text = status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : label;

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className={`d-inline-flex align-items-center gap-1 p-0 text-reset ${className}`.trim()}
      onClick={handleCopy}
      aria-label={ariaLabel || label}
      disabled={!value}
    >
      {status === 'copied' ? <Check2 aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
      <span aria-live="polite">{text}</span>
    </Button>
  );
};

CopyButton.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.string,
};

export default CopyButton;

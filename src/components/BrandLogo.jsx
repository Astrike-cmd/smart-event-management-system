import darkLogo from '../assets/eventify-logo-dark-transparent.png';
import lightLogo from '../assets/eventify-logo-light-transparent.png';

function BrandLogo({ className = '' }) {
  return (
    <span className={'brand-logo ' + className} aria-label="Eventify">
      <img className="brand-logo-light" src={lightLogo} alt="" />
      <img className="brand-logo-dark" src={darkLogo} alt="" />
    </span>
  );
}

export default BrandLogo;

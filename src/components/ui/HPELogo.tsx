interface HPELogoProps {
  className?: string;
}

const HPELogo = ({ className = '' }: HPELogoProps) => {
  return (
    <img 
      src="/hpe-logo.svg" 
      alt="HPE" 
      className={className} 
    />
  );
};

export default HPELogo;
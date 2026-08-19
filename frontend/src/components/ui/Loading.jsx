import { Loader2 } from 'lucide-react';

const Loading = ({
  fullPage = false,
  size = 'md',
  className = ''
}) => {
  const containerStyle = fullPage
    ? "fixed inset-0 bg-white/85 backdrop-blur-sm z-[2000] flex items-center justify-center"
    : "flex items-center justify-center p-8 w-full";

  const sizeMap = {
    sm: 16,
    md: 32,
    lg: 48
  };

  return (
    <div className={`${containerStyle} ${className}`}>
      <Loader2 className="animate-spin text-green-600" size={sizeMap[size] || sizeMap.md} />
    </div>
  );
};

export default Loading;

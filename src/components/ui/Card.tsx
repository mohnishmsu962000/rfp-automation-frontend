interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({ 
  children, 
  className = '',
  padding = 'md'
}: CardProps) {
  const paddingClasses = {
    sm: 'p-6',
    md: 'p-8', 
    lg: 'p-10'
  };
  
  return (
    <div className={`bg-section rounded-[20px] border border-gray-200 shadow-sm ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
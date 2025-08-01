// CustomTooltip.jsx
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';

interface CustomTooltipProps {
  content: string;
  ariaLabel: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ content, ariaLabel = "Tooltip" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen} delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={ariaLabel}
            onClick={handleClick}
          >
            <Info className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="whitespace-pre-line">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default CustomTooltip;
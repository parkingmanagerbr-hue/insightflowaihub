import { Cpu, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useOllama } from "@/hooks/useOllama";
import { cn } from "@/lib/utils";

interface OllamaStatusProps {
  className?: string;
  showModel?: boolean;
}

const OllamaStatus = ({ className, showModel = false }: OllamaStatusProps) => {
  const { status, selectedModel, isChecking, refresh } = useOllama();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
              status.connected
                ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400",
              className,
            )}
          >
            {status.connected ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            <Cpu className="w-3 h-3" />
            {showModel && status.connected && (
              <span className="max-w-[80px] truncate">{selectedModel}</span>
            )}
            {!showModel && (
              <span>{status.connected ? "Ollama Online" : "Ollama Offline"}</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="w-4 h-4 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                refresh();
              }}
              disabled={isChecking}
            >
              <RefreshCw className={cn("w-3 h-3", isChecking && "animate-spin")} />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {status.connected ? (
            <div className="space-y-1 text-xs">
              <p className="font-medium text-green-400">Ollama conectado</p>
              {status.version && <p className="text-muted-foreground">v{status.version}</p>}
              <p className="text-muted-foreground">Modelo: {selectedModel}</p>
            </div>
          ) : (
            <div className="space-y-1 text-xs">
              <p className="font-medium text-red-400">Ollama offline</p>
              <p className="text-muted-foreground max-w-[200px]">
                {status.error || "Execute: ollama serve"}
              </p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OllamaStatus;

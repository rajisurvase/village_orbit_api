import { useState, useRef, useEffect, useContext, useCallback } from "react";
import { MessageCircle, X, Send, Bot, Mic, MicOff, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useFooterVisibility } from "@/hooks/useFooterVisibility";
import { VillageContext } from "@/context/VillageContextConfig";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const VillageChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoScrollEnabled = useRef(true);
  const { i18n } = useTranslation();
  const isFooterVisible = useFooterVisibility();
  const { config } = useContext(VillageContext);

  // Dynamic colors based on footer visibility
  const bgColor = isFooterVisible ? "#32D26C" : "#0B5C38";
  const gradientStyle = {
    background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor} 100%)`,
  };

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("villageChatMessages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("villageChatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Production-ready auto-scroll using sentinel element
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current && isAutoScrollEnabled.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior, 
        block: "end" 
      });
    }
  }, []);

  // Scroll on new messages or loading state changes
  useEffect(() => {
    // Use requestAnimationFrame for smoother scrolling after DOM update
    const rafId = requestAnimationFrame(() => {
      scrollToBottom("smooth");
    });
    return () => cancelAnimationFrame(rafId);
  }, [messages, isLoading, scrollToBottom]);

  // Scroll when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Slight delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        scrollToBottom("auto");
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, isMinimized, scrollToBottom]);

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (isOpen && !isMinimized) {
      inactivityTimerRef.current = setTimeout(() => {
        setIsMinimized(true);
      }, 120000); // 2 minutes
    }
  };

  // Set up inactivity timer when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      resetInactivityTimer();
    }
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isOpen, isMinimized]);

  // Clean and process voice input text
  const cleanVoiceText = (text: string): string => {
    let cleaned = text.trim();
    
    // Remove common noise words and artifacts
    const noiseWords = ['um', 'uh', 'ah', 'er', 'like', 'you know'];
    noiseWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    
    // Remove extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    return cleaned;
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language based on current i18n language
      if (i18n.language === 'mr') {
        recognitionRef.current.lang = 'mr-IN';
      } else if (i18n.language === 'hi') {
        recognitionRef.current.lang = 'hi-IN';
      } else {
        recognitionRef.current.lang = 'en-US';
      }

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const cleanedText = cleanVoiceText(transcript);
        
        if (cleanedText) {
          setIsListening(false);
          // Auto-send voice message
          streamChat(cleanedText);
          resetInactivityTimer();
        } else {
          setIsListening(false);
          toast.error("I didn't hear anything, please try again.");
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          toast.error("I didn't hear anything, please try again.");
        } else if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please allow microphone access.");
        } else {
          toast.error("Voice input unavailable right now.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [i18n.language]);

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/village-chatbot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            language: i18n.language,
            villageConfig: config,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to start chat stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {
            /* ignore */
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    resetInactivityTimer(); // Reset inactivity timer on user action
    await streamChat(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        resetInactivityTimer(); // Reset inactivity timer on user action
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast.error("Failed to start voice input.");
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  };

  const handleOpen = () => {
    if (isMinimized) {
      setIsMinimized(false);
      resetInactivityTimer();
    } else {
      setIsOpen(true);
      resetInactivityTimer();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-24 right-6 z-[60]">
        <Button
          onClick={handleOpen}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-110"
          style={gradientStyle}
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Chat Popup */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-44 right-6 z-[60] w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div
            className="p-4 text-white flex items-center justify-between"
            style={gradientStyle}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Village Assistant</h3>
                <p className="text-xs text-white/80">Here to help you!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleMinimize}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white/20 text-white"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white/20 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm space-y-2 mt-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="font-medium">Welcome! How can I help you today?</p>
                <p className="text-xs">Ask me about village services, certificates, or anything else!</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Sentinel element for smooth auto-scroll */}
            <div ref={messagesEndRef} className="h-px" />
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Type or speak your message..."}
                disabled={isLoading || isListening}
                className="flex-1"
              />
              <Button
                onClick={toggleVoiceInput}
                disabled={isLoading}
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                className={`shrink-0 ${isListening ? "animate-pulse" : ""}`}
              >
                {isListening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim() || isListening}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VillageChatbot;

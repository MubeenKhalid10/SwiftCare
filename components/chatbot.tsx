"use client"

import React, { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config"
import { toast } from "sonner"

type Message = {
    id: string
    role: "user" | "bot"
    content: string
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "bot",
            content: "Hello! I'm Swiftcare's virtual assistant. I can help you with appointments, payments, doctor timings, and basic medical information. How can I assist you today?",
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom()
        }
    }, [messages, isOpen])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()

        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHATBOT}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userMessage.content }),
            })

            if (!response.ok) {
                throw new Error("Failed to get response")
            }

            const data = await response.json()

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "bot",
                content: data.reply || "I'm sorry, I couldn't process that request.",
            }

            setMessages((prev) => [...prev, botMessage])
        } catch (error) {
            console.error("Chatbot error:", error)
            toast.error("Failed to connect to the assistant. Please try again later.")

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "bot",
                content: "Sorry, I'm having trouble connecting to the server right now. Please try again later.",
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    // Handle Ctrl+Enter to send
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Simple Markdown to HTML formatter for the bot response
    const formatMessage = (content: string) => {
        // Bold: **text**
        let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic: *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Newlines
        formatted = formatted.replace(/\n/g, '<br />')

        // Lists: Replace "- item" with "• item"
        formatted = formatted.replace(/(?:^|<br \/>)- (.*)/g, '<br />• $1')

        return <div dangerouslySetInnerHTML={{ __html: formatted }} />
    }

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 z-50 animate-bounce"
                    aria-label="Open chat assistant"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-full max-w-[350px] sm:max-w-[400px] h-[500px] max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200 animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">SwiftCare Assistant</h3>
                                <p className="text-xs text-blue-100 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
                            aria-label="Close chat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${message.role === "user"
                                            ? "bg-blue-600 text-white rounded-br-sm"
                                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                                        }`}
                                >
                                    {message.role === "bot" ? (
                                        <div className="prose prose-sm prose-blue leading-relaxed">
                                            {formatMessage(message.content)}
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex w-full justify-start">
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm p-3 shadow-sm flex items-center gap-2 text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                    <span className="text-xs font-medium">Assistant is typing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form
                            onSubmit={handleSend}
                            className="flex items-end gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about doctors, payments..."
                                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-3 py-2 text-sm"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim() || isLoading}
                                className={`h-9 w-9 rounded-lg shrink-0 ${input.trim() && !isLoading
                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                        : "bg-gray-200 text-gray-400"
                                    } transition-all`}
                            >
                                <Send className="w-4 h-4" />
                                <span className="sr-only">Send message</span>
                            </Button>
                        </form>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400 font-medium">
                                AI can make mistakes. Verify critical medical info.
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

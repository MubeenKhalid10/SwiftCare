"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config"
import { getAccessToken } from "@/lib/auth.service"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

type Message = {
    id: string
    role: "user" | "bot"
    content: string
}

export function Chatbot() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
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
    const hasAccessToken = !!getAccessToken()
    const isAuthed = isAuthenticated && hasAccessToken


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

        if (!input.trim() || isLoading || !isAuthed) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const token = getAccessToken()
            console.log('[chatbot] sending message, token present:', !!token)

            let response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHATBOT}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ message: userMessage.content }),
                credentials: "include",
            })

            // If unauthorized, try to refresh once (refresh token is HTTP-only cookie)
            if (response.status === 401) {
                console.warn('[chatbot] initial request 401, attempting token refresh')
                try {
                    const refreshRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                    })

                    if (refreshRes.ok) {
                        const refreshData = await refreshRes.json().catch(() => ({}))
                        if (refreshData.accessToken) {
                            localStorage.setItem('accessToken', refreshData.accessToken)
                            console.log('[chatbot] token refreshed, retrying chat request')
                        }
                        // retry original request with new token if available
                        const newToken = getAccessToken()
                        response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHATBOT}`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
                            },
                            body: JSON.stringify({ message: userMessage.content }),
                            credentials: "include",
                        })
                    } else {
                        const txt = await refreshRes.text().catch(() => '')
                        console.warn('[chatbot] refresh failed', refreshRes.status, txt)
                    }
                } catch (refreshErr) {
                    console.error('[chatbot] refresh attempt error', refreshErr)
                }
            }

            if (!response.ok) {
                // attempt to read body for diagnostics
                const text = await response.text().catch(() => '')
                console.error('[chatbot] response not ok', response.status, text)
                throw new Error(`Failed to get response: ${response.status} ${text ? '- ' + text : ''}`)
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
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-all hover:scale-110 z-50 animate-pulse-gentle"
                    aria-label="Open chat assistant"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-full max-w-[350px] sm:max-w-[400px] h-[500px] max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-xl shadow-primary/20 overflow-hidden z-50 border border-border animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-primary-600 p-4 text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">SwiftCare Assistant</h3>
                                <p className="text-xs text-white/90 flex items-center gap-1">
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
                    <div className="flex-1 overflow-y-auto p-4 bg-white/50 flex flex-col gap-4">
                        {!isAuthLoading && !isAuthed && (
                            <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm shadow-sm">
                                <p className="font-medium">Login required to use the assistant.</p>
                                <p className="mt-1 text-xs">
                                    Please <Link href="/auth/login" className="underline font-semibold">log in</Link> or <Link href="/auth/register" className="underline font-semibold">sign up</Link> to chat.
                                </p>
                            </div>
                        )}
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${message.role === "user"
                                            ? "bg-gradient-to-r from-primary to-primary-600 text-white rounded-br-sm"
                                            : "bg-white text-foreground border border-border rounded-bl-sm"
                                        }`}
                                >
                                    {message.role === "bot" ? (
                                        <div className="prose prose-sm prose-primary leading-relaxed">
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
                                <div className="bg-white border border-border rounded-2xl rounded-bl-sm p-3 shadow-sm flex items-center gap-2 text-foreground/70">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span className="text-xs font-medium">Assistant is typing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-border">
                        <form
                            onSubmit={handleSend}
                            className="flex items-end gap-2 bg-white p-1 rounded-xl border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isAuthed ? "Ask about doctors, payments..." : "Log in to start chatting"}
                                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-3 py-2 text-sm"
                                disabled={isLoading || !isAuthed}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim() || isLoading || !isAuthed}
                                className={`h-9 w-9 rounded-lg shrink-0 ${input.trim() && !isLoading
                                        ? "bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md"
                                        : "bg-muted text-muted-foreground"
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

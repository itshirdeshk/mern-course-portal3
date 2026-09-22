import { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext(null)

let idSeq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (message, type = "info") => {
      const id = ++idSeq
      setToasts((t) => [...t, { id, message, type }])
      setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const toast = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => dismiss(t.id)}
            className="fade-up glass card cursor-pointer px-4 py-3 text-sm shadow-xl min-w-[16rem] max-w-sm"
            style={{
              borderColor:
                t.type === "success"
                  ? "var(--color-success)"
                  : t.type === "error"
                    ? "var(--color-danger)"
                    : "var(--color-border)",
            }}
          >
            <div className="flex items-start gap-2">
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{
                  background:
                    t.type === "success"
                      ? "var(--color-success)"
                      : t.type === "error"
                        ? "var(--color-danger)"
                        : "var(--color-primary)",
                }}
              />
              <span className="leading-snug">{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast Must Be Used Within ToastProvider")
  return ctx
}

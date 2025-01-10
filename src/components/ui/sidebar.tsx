"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"

type SidebarContext = {
    state: "expanded" | "collapsed"
    open: boolean
    setOpen: (open: boolean) => void
    openMobile: boolean
    setOpenMobile: (open: boolean) => void
    isMobile: boolean
    toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
    const context = React.useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider")
    }
    return context
}

const SidebarProvider = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
}
>(
    (
        {
            defaultOpen = true,
            open: openProp,
            onOpenChange: setOpenProp,
            className,
            style,
            children,
            ...props
        },
        ref
    ) => {
        const [openMobile, setOpenMobile] = React.useState(false)
        const [_open, _setOpen] = React.useState(defaultOpen)
        const open = openProp ?? _open
        const setOpen = React.useCallback(
            (value: boolean | ((value: boolean) => boolean)) => {
                const openState = typeof value === "function" ? value(open) : value
                if (setOpenProp) {
                    setOpenProp(openState)
                } else {
                    _setOpen(openState)
                }
                document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
            },
            [setOpenProp, open]
        )

        const isMobile = React.useMemo(() => {
            if (typeof window === "undefined") return false
            return window.innerWidth < 768
        }, [])

        const toggleSidebar = React.useCallback(() => {
            return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
        }, [isMobile, setOpen])

        const state = open ? "expanded" : "collapsed"

        const contextValue = React.useMemo<SidebarContext>(
            () => ({
                state,
                open,
                setOpen,
                isMobile,
                openMobile,
                setOpenMobile,
                toggleSidebar,
            }),
            [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
        )

        return (
            <SidebarContext.Provider value={contextValue}>
                <div
                    style={
                        {
                            "--sidebar-width": SIDEBAR_WIDTH,
                            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                            ...style,
                        } as React.CSSProperties
                    }
                    className={cn(
                        "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            </SidebarContext.Provider>
        )
    }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
}
>(
    (
        {
            side = "left",
            variant = "sidebar",
            collapsible = "offcanvas",
            className,
            children,
            ...props
        },
        ref
    ) => {
        const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

        if (collapsible === "none") {
            return (
                <div
                    className={cn(
                        "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            )
        }

        if (isMobile) {
            return (
                <Sheet open={openMobile} onOpenChange={setOpenMobile}>
                    <SheetContent
                        data-sidebar="sidebar"
                        data-mobile="true"
                        className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
                        style={
                            {
                                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                            } as React.CSSProperties
                        }
                        side={side}
                    >
                        <div className="flex h-full w-full flex-col">{children}</div>
                    </SheetContent>
                </Sheet>
            )
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", className)}
            onClick={(event) => {
                onClick?.(event)
                toggleSidebar()
            }}
            {...props}
        >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col gap-2 p-6", className)}
        {...props}
    />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-1 flex-col gap-4 p-4", className)}
        {...props}
    />
))
SidebarContent.displayName = "SidebarContent"

const SidebarMenu = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&>svg]:h-5 [&>svg]:w-5",
    {
        variants: {
            variant: {
                default: "hover:bg-accent hover:text-accent-foreground",
                ghost: "hover:bg-transparent hover:text-accent-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const SidebarMenuButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<"button"> & {
    asChild?: boolean
    variant?: VariantProps<typeof sidebarMenuButtonVariants>["variant"]
    isActive?: boolean
}
>(({ className, asChild, variant, isActive, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
        <Comp
            ref={ref}
            className={cn(
                sidebarMenuButtonVariants({ variant }),
                isActive && "bg-accent text-accent-foreground",
                className
            )}
            {...props}
        />
    )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
}


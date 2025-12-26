"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import LoginFlowDialog from "../molecules/order-now/LoginFlowDialog";

const NAV_LINKS = [
	{ href: "/", label: "الرئيسية" },
	{ href: "/contact", label: "تواصل معنا" },
	{ href: "/drivers", label: "السائقين" },
	{ href: "/contracts", label: "التعاقدات" },
	{ href: "/articles", label: "المقالات" },
];



export default function Navbar() {
	const pathname = usePathname();
    const [open, setOpen] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false);
	const [user, setUser] = useState(null);

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		// Read user from localStorage
		try {
			const raw = localStorage.getItem("user");
			if (!raw) return;
			const parsed = JSON.parse(raw);
			if (parsed && typeof parsed === "object") setUser(parsed);
		} catch {
			// ignore
		}
	}, []);

	useEffect(() => {
		function onDocClick(e) {
			if (!dropdownRef.current) return;
			if (!dropdownRef.current.contains(e.target)) setDropdownOpen(false);
		}
		document.addEventListener("mousedown", onDocClick);
		return () => document.removeEventListener("mousedown", onDocClick);
	}, []);

	useEffect(() => {
		// Close menus on route change
		setMenuOpen(false);
		setDropdownOpen(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	function handleLogout() {
		localStorage.removeItem("user");
		setUser(null);
		setDropdownOpen(false);
	}

	const avatarLetter = useMemo(
		() => (user?.name?.trim()?.[0] || "U").toUpperCase(),
		[user?.name]
	);

	const activeHref = useMemo(() => {
		// Basic active matcher (works for nested routes too)
		if (!pathname) return "/";
		const exact = NAV_LINKS.find((l) => l.href === pathname)?.href;
		if (exact) return exact;
		const starts = NAV_LINKS.find((l) => l.href !== "/" && pathname.startsWith(l.href));
		return starts?.href || "/";
	}, [pathname]);

	return (
		<header dir="rtl" className="sticky top-0 z-[1000] w-full">
			{/* Background / blur */}
			<div className="absolute inset-0 -z-10 border-b border-white/20 bg-white/70 backdrop-blur-xl" />
			{/* Subtle gradient glow */}
			<div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-sky-100/70 to-transparent" />

			<div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
				{/* Brand */}
				<Link href="/" className="group flex items-center gap-3">
					<motion.div
						whileHover={{ rotate: -6, scale: 1.03 }}
						whileTap={{ scale: 0.98 }}
						className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm ring-1 ring-white/40"
					>
						<div className="absolute -inset-1 rounded-[18px] bg-gradient-to-br from-sky-500/25 to-blue-600/25 blur-md" />
						<DropletIcon className="relative h-6 w-6" />
					</motion.div>

					<div className="leading-tight">
						<div className="text-2xl font-extrabold tracking-tight text-slate-900">
							وايت مياة
						</div>
						<div className="text-sm font-medium text-slate-500">
							خدمة توصيل سريعة
						</div>
					</div>
				</Link>

				{/* Desktop nav */}
				<nav className="hidden items-center gap-2 lg:flex">
					{NAV_LINKS.map((l) => {
						const isActive = activeHref === l.href;
						return (
							<Link
								key={l.href}
								href={l.href}
								className={[
									"relative rounded-full px-4 py-2 text-sm font-semibold transition",
									"text-slate-700 hover:text-slate-900",
									"hover:bg-white/70 hover:ring-1 hover:ring-slate-200/70",
								].join(" ")}
							>
								<span className="relative z-10">{l.label}</span>

								{/* Active pill */}
								{isActive && (
									<motion.span
										layoutId="navActivePill"
										className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500/15 to-blue-600/15 ring-1 ring-sky-200/60"
										transition={{ type: "spring", stiffness: 420, damping: 34 }}
									/>
								)}

								{/* Hover underline */}
								<motion.span
									className="absolute bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
									whileHover={{ width: "55%" }}
									transition={{ type: "spring", stiffness: 500, damping: 30 }}
								/>
							</Link>
						);
					})}
				</nav>

				{/* Actions */}
				<div className="flex items-center gap-2">
					<motion.div whileTap={{ scale: 0.98 }}>
						<Link
							// href="/order"
							href="/"
							onClick={() => setOpen(true)}
							className={[
								"relative inline-flex items-center justify-center rounded-full px-6 py-3",
								"text-sm font-bold text-white shadow-md",
								"bg-gradient-to-r from-sky-500 to-blue-600",
								"ring-1 ring-white/40 transition hover:brightness-110",
							].join(" ")}
						>
							<span className="absolute -inset-1 rounded-full bg-gradient-to-r from-sky-500/25 to-blue-600/25 blur-md" />
							<span className="relative">اطلب الآن</span>
						</Link>
					</motion.div>

					{/* Logged out */}
					 <LoginFlowDialog open={open} onOpenChange={setOpen} />
					{!user ? (
						<Link
						
							href="/login"
							className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/70 hover:text-slate-900 hover:ring-1 hover:ring-slate-200/70 sm:flex"
						>
							<UserIcon className="h-5 w-5" />
							تسجيل الدخول
						</Link>
						
					) : (
						<div className="relative hidden sm:block" ref={dropdownRef}>
							<button
								type="button"
								onClick={() => setDropdownOpen((v) => !v)}
								className={[
									"inline-flex items-center gap-2 rounded-full px-3 py-2",
									"bg-white/70 text-slate-800 shadow-sm",
									"ring-1 ring-slate-200/70 backdrop-blur",
									"transition hover:bg-white",
								].join(" ")}
								aria-haspopup="menu"
								aria-expanded={dropdownOpen}
							>
								<Avatar user={user} fallbackLetter={avatarLetter} />
								<span className="max-w-[160px] truncate text-sm font-bold">
									{user?.name || "حسابي"}
								</span>
								<motion.span
									animate={{ rotate: dropdownOpen ? 180 : 0 }}
									transition={{ type: "spring", stiffness: 500, damping: 35 }}
								>
									<ChevronDown className="h-4 w-4 opacity-70" />
								</motion.span>
							</button>

							<AnimatePresence>
								{dropdownOpen && (
									<motion.div
										initial={{ opacity: 0, y: 10, scale: 0.98 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 8, scale: 0.985 }}
										transition={{ type: "spring", stiffness: 450, damping: 32 }}
										className="absolute left-0 top-12 w-60 overflow-hidden rounded-2xl bg-white/90 shadow-xl ring-1 ring-slate-200/70 backdrop-blur"
										role="menu"
									>
										<div className="px-4 py-3">
											<div className="text-xs font-semibold text-slate-500">الحساب</div>
											<div className="mt-0.5 truncate text-sm font-bold text-slate-800">
												{user?.name || "حسابي"}
											</div>
										</div>

										<div className="h-px bg-slate-200/70" />

										<MenuItemLink href="/profile" onClick={() => setDropdownOpen(false)}>
											الملف الشخصي
										</MenuItemLink>

										<MenuItemLink href="/orders" onClick={() => setDropdownOpen(false)}>
											طلباتي
										</MenuItemLink>

										<div className="h-px bg-slate-200/70" />

										<button
											type="button"
											onClick={handleLogout}
											className="flex w-full items-center justify-between px-4 py-3 text-right text-sm font-bold text-red-600 transition hover:bg-red-50"
											role="menuitem"
										>
											<span>تسجيل الخروج</span>
											<span className="text-xs opacity-60">↩</span>
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					)}

					{/* Mobile hamburger */}
					<button
						type="button"
						onClick={() => setMenuOpen((v) => !v)}
						className="inline-flex items-center justify-center rounded-2xl p-2 text-slate-800 ring-1 ring-slate-200/70 transition hover:bg-white/70 lg:hidden"
						aria-label="Open menu"
						aria-expanded={menuOpen}
					>
						<motion.div
							animate={{ rotate: menuOpen ? 90 : 0 }}
							transition={{ type: "spring", stiffness: 500, damping: 35 }}
						>
							<MenuIcon className="h-6 w-6" />
						</motion.div>
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			<AnimatePresence>
				{menuOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ type: "spring", stiffness: 260, damping: 30 }}
						className="overflow-hidden border-t border-slate-200/60 bg-white/70 backdrop-blur-xl lg:hidden"
					>
						<div className="mx-auto max-w-7xl px-4 py-4">
							<motion.nav
								initial="hidden"
								animate="show"
								exit="hidden"
								variants={{
									hidden: { opacity: 0 },
									show: {
										opacity: 1,
										transition: { staggerChildren: 0.04, delayChildren: 0.03 },
									},
								}}
								className="flex flex-col gap-2"
							>
								{NAV_LINKS.map((l) => {
									const isActive = activeHref === l.href;
									return (
										<motion.div
											key={l.href}
											variants={{
												hidden: { opacity: 0, y: 8 },
												show: { opacity: 1, y: 0 },
											}}
										>
											<Link
												href={l.href}
												onClick={() => setMenuOpen(false)}
												className={[
													"flex items-center justify-between rounded-2xl px-4 py-3",
													"text-sm font-bold transition",
													isActive
														? "bg-gradient-to-r from-sky-500/15 to-blue-600/15 text-slate-900 ring-1 ring-sky-200/60"
														: "bg-white/70 text-slate-800 ring-1 ring-slate-200/70 hover:bg-white",
												].join(" ")}
											>
												<span>{l.label}</span>
												<span className="text-xs opacity-60">←</span>
											</Link>
										</motion.div>
									);
								})}
							</motion.nav>

							<div className="mt-4 rounded-2xl bg-white/70 p-3 ring-1 ring-slate-200/70">
								{!user ? (
									<Link
										href="/login"
										className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-white"
										onClick={() => setMenuOpen(false)}
									>
										<span className="inline-flex items-center gap-2">
											<UserIcon className="h-5 w-5" />
											تسجيل الدخول
										</span>
										<span className="text-xs opacity-60">←</span>
									</Link>
								) : (
									<div className="flex items-center justify-between gap-3 px-2 py-1">
										<div className="flex items-center gap-3">
											<Avatar user={user} fallbackLetter={avatarLetter} />
											<div className="min-w-0">
												<div className="truncate text-sm font-extrabold text-slate-900">
													{user?.name || "حسابي"}
												</div>
												<div className="mt-1 flex gap-3 text-xs font-semibold">
													<Link
														href="/profile"
														className="text-sky-600 underline"
														onClick={() => setMenuOpen(false)}
													>
														الملف الشخصي
													</Link>
													<button
														type="button"
														onClick={() => {
															handleLogout();
															setMenuOpen(false);
														}}
														className="text-red-600 underline"
													>
														خروج
													</button>
												</div>
											</div>
										</div>

										<motion.div whileTap={{ scale: 0.98 }}>
											<Link
												href="/order"
												className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md ring-1 ring-white/40"
												onClick={() => setMenuOpen(false)}
											>
												اطلب الآن
											</Link>
										</motion.div>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}

/* --- Small components --- */

function MenuItemLink({
	href,
	children,
	onClick,
}) {
	return (
		<Link
			href={href}
			onClick={onClick}
			className="flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
			role="menuitem"
		>
			<span>{children}</span>
			<span className="text-xs opacity-60">←</span>
		</Link>
	);
}

function Avatar({ user, fallbackLetter }) {
	const url = user?.avatarUrl;
	if (url) {
		// eslint-disable-next-line @next/next/no-img-element
		return (
			<img
				src={url}
				alt="avatar"
				className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200/70"
			/>
		);
	}
	return (
		<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-extrabold text-white ring-1 ring-white/40">
			{fallbackLetter}
		</div>
	);
}

/* --- Icons --- */

export function DropletIcon({ className = "" }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M12 2s6 7 6 12a6 6 0 1 1-12 0C6 9 12 2 12 2Z"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path
				d="M9.5 14.2c.2 1.8 1.6 3.2 3.4 3.4"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.8"
			/>
		</svg>
	);
}

function UserIcon({ className = "" }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M20 21a8 8 0 0 0-16 0"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<path d="M12 13a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" stroke="currentColor" strokeWidth="2" />
		</svg>
	);
}

function MenuIcon({ className = "" }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function ChevronDown({ className = "" }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M6 9l6 6 6-6"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

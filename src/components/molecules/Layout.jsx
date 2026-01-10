'use client';

import React from 'react';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

const Layout = ({ children }) => {
	const pathname = usePathname();

	const hideNavbarRoutes = ['/login', '/otp'];
	const hideNavbar = hideNavbarRoutes.includes(pathname);

	return (
		<AuthProvider>
			<div>
				{!hideNavbar && <Navbar />}

				<Toaster 
					position="top-center"
					reverseOrder={false}
					toastOptions={{ duration: 3000 }}
				/>

				<div className={!hideNavbar ? 'pt-20' : ''}>
					{children}
				</div>
			</div>
		</AuthProvider>
	);
};

export default Layout;

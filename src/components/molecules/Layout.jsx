import React from 'react';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

const Layout = ({ children }) => {
	return (
		<AuthProvider>
			<div className="">
				<Navbar />
				<Toaster 
					position="top-center"
					reverseOrder={false}
					toastOptions={{
						duration: 3000,
					}}
				/>
				<div className="pt-20">
					{children}
				</div>
			</div>
		</AuthProvider>
	);
};

export default Layout;
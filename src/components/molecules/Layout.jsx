import React from 'react';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
	return (
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
	);
};

export default Layout;
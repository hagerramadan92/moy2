
import Layout from '@/components/molecules/Layout';
import './globals.css';
import { Cairo, Tajawal, Changa, Almarai, Noto_Kufi_Arabic } from "next/font/google";


export const almarai = Almarai({
	subsets: ["arabic"],
	weight: ["300", "400", "700", "800"],
	display: "swap",
});



export default async function RootLayout({ children, params }) {


	return (
		<html lang={"ar"} dir={'rtl'} suppressHydrationWarning>
			<body className={`  ${almarai.variable} `}>
				<Layout>{children}</Layout>
			
			</body>
		</html>
	);
}

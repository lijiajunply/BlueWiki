import Image from 'next/image';

export default async function Home() {
    return (
        <div
            className="h-screen flex items-center justify-center redirect-bg">
            <div className="flex flex-col items-center justify-center">
                <Image src="/logo.png" alt="BlueWiki Logo" width={100} height={100} className={'mb-4'}/>
                <div className="text-4xl font-bold text-gray-50 mb-4">BlueWiki</div>
                <div className="text-gray-300">正在重定向...</div>
            </div>
        </div>
    );
}
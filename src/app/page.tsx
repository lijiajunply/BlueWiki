import {prisma} from '@/lib/prisma';
import {redirect} from 'next/navigation';

export default async function Home() {
    const userCount = await prisma.user.count();

    if (userCount === 0) {
        redirect('/first-use');
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="text-4xl font-bold text-gray-800 mb-4">BlueWiki</div>
                <div className="text-gray-600">正在重定向...</div>
            </div>
        </div>
    );
}
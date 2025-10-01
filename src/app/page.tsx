import {prisma} from '@/lib/prisma';
import {redirect} from 'next/navigation';

export default async function Home() {
    const userCount = await prisma.user.count();

    if (userCount === 0) {
        redirect('/first-use');
    } else {
        redirect('/home');
    }
}
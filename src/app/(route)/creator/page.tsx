"use client";
import {FiSlack} from "react-icons/fi";

import Image from "next/image";
import React, {useEffect, useState} from "react";

export default function Creator() {
    const [creators, setCreators] = useState<{ id: number, name: string, avatar: string }[]>([]);
    //const response = await fetch(`/api/creators/`);

    useEffect(() => {
        fetch(`/api/creators/`)
            .then((response) => response.json())
            .then((data) => setCreators(data.creators))
            .catch((error) => console.error('Error loading creators:', error));
    }, []);

    return (
        <div className='min-h-[calc(100vh-120px)] flex flex-col items-center justify-center'>
            <div className='text-center mt-10'>
                <div className='text-4xl font-bold'>创建者</div>
            </div>

            {creators.length === 0 ? (
                <div className='flex-1 flex flex-col items-center justify-center'>
                    <div className="text-center">
                        <FiSlack style={{fontSize: "100px", color: "#4A5568"}}/>
                        <br/>
                        <div className="text-2xl font-bold">暂无数据</div>
                    </div>
                </div>
            ) : <div className='grid grid-cols-3 gap-4'>
                {creators.map((creator) => (
                    <div className="card bg-base-100 w-96 shadow-sm" key={creator.id}>
                        <figure className="px-10 pt-10">
                            <Image
                                src={creator.avatar || '/person.png'}
                                alt="avatar"
                                width={100}
                                height={100}
                                className="rounded-xl"
                            />
                        </figure>
                        <div className="card-body items-center text-center">
                            <h2 className="card-title">{creator.name}</h2>
                        </div>
                    </div>
                ))}
            </div>}
        </div>
    );
}

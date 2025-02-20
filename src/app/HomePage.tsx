"use client"

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {motion} from "framer-motion";
import {Button, Icon, Text, TextInput, Title} from "@tremor/react";
import {RiArrowLeftLine, RiMedal2Fill, RiMusicLine, RiPlayFill} from "@remixicon/react";
import Link from "next/link";
import {Card} from "@/ui/components";
import {Rubik_80s_Fade} from "next/font/google";

const rubikS80Fade = Rubik_80s_Fade({
    subsets: ["hebrew"],
    weight: "400",
    preload: true
})

export function HomePageContent() {
    const [id, setId] = useState<string>()
    const router = useRouter()

    return (
        <div className={"img-filter bg-tremor-brand overflow-x-hidden"}>
            <div className={"p-4"}>
                <div className={"md:flex gap-10 justify-center items-center md:min-h-screen md:max-w-5xl m-auto"}>

                    <div className={"w-[96%] m-auto my-6 relative md:w-80"}> {/*Image cont*/}
                        <motion.div
                            initial={{rotate: 0}}
                            whileInView={{rotate: 6}}
                            viewport={{once: true}}
                            transition={{type: "spring", stiffness: 100}}
                            className={"w-full h-full absolute top-0 z-0 bg-[#50358C]/40 rounded-3xl"}
                        />

                        <picture>
                            <source media="(max-width: 768px)" srcSet="/images/person-bg-ho.webp"/>
                            <source media="(min-width: 768px)" srcSet="/images/person-bg-ver.webp"/>
                            <img
                                alt={"Person sits, listening to music"}
                                className={"w-full h-full object-cover rounded-3xl z-10"}
                            />
                        </picture>

                        <motion.div
                            initial={{rotate: 0}}
                            whileInView={{rotate: -6}}
                            viewport={{once: true}}
                            transition={{type: "spring", stiffness: 100}}
                            className={`w-full h-full absolute z-20 bg-[#DFD0FF]/40 rounded-3xl top-0`}/>

                        <div className={"absolute z-30 transform translate-x-1/2 -translate-y-1/2 top-1/2 right-1/2"}>
                            <motion.div
                                initial={{scale: 0, rotate: 0}}
                                whileInView={{scale: 1.25, rotate: 360}}
                                viewport={{once: true}}
                                transition={{type: "spring", stiffness: 100}}>
                                <Icon size={"xs"} icon={RiPlayFill} className={`text-white drop-shadow-2xl play-icon`}/>
                            </motion.div>
                        </div>
                    </div>

                    <div className={"grow"}>
                        <div className={"text-right mt-24 mb-12 m-2"}>
                            <Title className={`${rubikS80Fade.className} text-white drop-shadow-xl`}>
                                <span className={"text-[150px]/5 sm:text-[170px]/5"}>מי </span>
                                <br/>
                                <span className={"text-7xl/10 sm:text-8xl/10"}>שישמע!</span>
                            </Title>

                            <Text className={"text-2xl font-semibold mt-6 text-white"}>
                                בטוחים שאתם שאזאם אנושי?
                                <br/>
                                בואו תוכיחו!
                            </Text>
                        </div>

                        <div
                            className={"flex gap-4 mb-14 h-18 rounded-full shadow-lg items-center justify-center bg-[#2E1D53]"}>
                            <TextInput
                                value={id}
                                onValueChange={setId}
                                placeholder={"הדבק כאן מזהה חדר..."}
                                className={`h-12 text-3xl bg-transparent text-white mx-3 border-0 hover:bg-transparent
                                focus:ring-0 rounded-full input-id grow`}
                                inputMode={"numeric"}
                                enterKeyHint={"go"}
                            />

                            <Button className={"h-18 w-16 bg-[#EAE0FF] rounded-full border-none"}
                                    disabled={!id} onClick={() => router.push(`/room/${id}`)}>
                                <Icon icon={RiArrowLeftLine} size={"lg"}/>
                            </Button>
                        </div>
                    </div>
                </div>

                <img src={"/images/pattern.svg"}
                     className={"max-w-none w-[140%] -mx-10 my-10 md:-mt-20 animate-pulse-op opacity-50 -z-50!"}/>

                <div className={"grid grid-cols-2 md:grid-cols-3 gap-4 m-2 max-w-2xl md:m-auto md:mt-24"}>

                    <Link href={"/room"}>
                        <Card className={"relative py-6 text-center"}>
                            <Icon icon={RiMedal2Fill} size={"xl"} className={"text-secondary-500"}/>
                            <Text
                                className={"text-lg tracking-wide hover:underline"}
                            >
                                צרו חדר והתחרו עם החברים!
                            </Text>
                            <div
                                className={"h-10 w-10 border-t-4 border-l-4 border-secondary-500 absolute top-2 left-2"}/>
                        </Card>
                    </Link>


                    <div/>
                    <div/>
                    <div className="hidden md:block"></div>

                    <img src={"/images/logo-bg.png"}
                         className={"rounded-3xl shadow-lg"}/>

                    <div/>
                    <div/>
                    <div className="hidden md:block"></div>
                    <div className="hidden md:block"></div>
                    <div className="hidden md:block"></div>
                    <div className="hidden md:block"></div>

                    <Link href={"/contribute"}>
                        <Card
                            className={"w-full h-full relative text-center"}>
                            <Icon icon={RiMusicLine} size={"xl"} className={"text-secondary-500"}/>
                            <Text className={"text-lg tracking-wide hover:underline"}>
                                הכניסו לתחרות את השירים האהובים עליכם!
                            </Text>

                            <div className={"h-10 w-10 border-b-4 border-r-4 border-secondary-500 " +
                                "absolute bottom-2 right-2"}/>
                        </Card>
                    </Link>

                </div>

                {/*<div className={"mt-24 flex gap-2 p-2 max-w-md mx-auto"}>*/}
                {/*    <Button variant={"primary"} size={"lg"} className={'w-full'}>*/}
                {/*        התחברו*/}
                {/*    </Button>*/}
                {/*    <Button size={"md"} className={"w-full"}>*/}
                {/*        אודות*/}
                {/*    </Button>*/}
                {/*</div>*/}
            </div>
        </div>
    );
}

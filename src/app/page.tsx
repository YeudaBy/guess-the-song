"use client"

import {Button, Icon, Text, TextInput, Title} from "@tremor/react";
import {RiArrowLeftLine, RiMedal2Fill, RiMusicLine, RiPlayFill} from "@remixicon/react";
import Link from "next/link";
import React, {useState} from "react";
import {Card} from "@/ui/components";
import {Rubik_80s_Fade} from "next/font/google";
import {motion} from "framer-motion";
import {useRouter} from "next/navigation";

const rubikS80Fade = Rubik_80s_Fade({
    subsets: ["hebrew"],
    weight: "400",
    preload: true
})

export default function Home() {
    const [id, setId] = useState<string>()
    const router = useRouter()

    return (
        <div className={"img-filter bg-tremor-brand overflow-x-hidden"}>
            <div className={"p-4"}>
                <div className={"md:flex gap-10 justify-center items-center"}>
                    <div className={"w-[96%] m-auto my-6 relative"}>
                        <motion.div
                            animate={{rotate: 6}}
                            transition={{type: "spring", stiffness: 100}}
                            className={"w-full h-full absolute top-0 z-0 bg-[#50358C]/40 rounded-3xl"}
                        />

                        <img src={"/images/person-bg-ho.webp"} alt={"Person sits, listen to music"}
                             className={"w-full object-cover rounded-3xl sm:hidden z-10"}/>

                        <motion.div
                            animate={{rotate: -6}}
                            transition={{type: "spring", stiffness: 100}}
                            className={`w-full h-full absolute z-20 bg-[#DFD0FF]/40 rounded-3xl top-0`}/>

                        <div className={"absolute z-30 transform translate-x-1/2 -translate-y-1/2 top-1/2 right-1/2"}>
                            <motion.div
                                animate={{scale: 1.25}}
                                transition={{type: "spring", stiffness: 100}}>
                                <Icon size={"xs"} icon={RiPlayFill} className={`text-white drop-shadow-2xl play-icon`}/>
                            </motion.div>
                        </div>
                    </div>


                    <img src={"/images/person-bg-ver.webp"} alt={"Person sits, listen to music"}
                         className={"h-80 object-cover rounded-3xl hidden md:block"}/>

                    <div>
                        <div className={"text-right mt-24 mb-12 m-2"}>
                            <Title className={`${rubikS80Fade.className} text-white drop-shadow-xl`}>
                                <span className={"text-[170px]/5"}>מי </span>
                                <br/>
                                <span className={"text-8xl/10"}>שישמע!</span>
                            </Title>

                            <Text className={"text-2xl font-semibold mt-6 text-white"}>
                                בטוחים שאתם שאזאם אנושי?
                                <br/>
                                בואו תוכיחו!
                            </Text>
                        </div>

                        <div
                            className={"flex gap-4 mb-14 mx-10 h-20 rounded-full shadow-lg items-center justify-center bg-[#2E1D53]"}>
                            <TextInput
                                value={id}
                                onValueChange={setId}
                                placeholder={"הדבק כאן מזהה חדר..."}
                                className={`h-12 text-3xl bg-transparent text-white mx-3 border-0 hover:bg-transparent
                                focus:ring-0 rounded-full input-id`}
                                inputMode={"numeric"}
                                enterKeyHint={"go"}
                            />

                            <Button className={"size-20 bg-[#EAE0FF] rounded-full border-none"}
                                    disabled={!id} onClick={() => router.push(`/room/${id}`)}>
                                <Icon icon={RiArrowLeftLine} size={"xl"}/>
                            </Button>
                        </div>
                    </div>
                </div>

                <img src={"/images/pattern.svg"} className={"max-w-none w-[140%] -mx-10 my-10 animate-pulse"}/>

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

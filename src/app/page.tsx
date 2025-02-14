"use client"

import {Button, Card, Icon, Text, TextInput, Title} from "@tremor/react";
import {RiArrowLeftLine, RiMedal2Fill, RiMusicLine} from "@remixicon/react";
import Link from "next/link";
import {motion} from "framer-motion";
import Image from "next/image";
import {useState} from "react";

export default function Home() {
    const [id, setId] = useState<string>()

    return (
        <div className={""}>
            <div className={"m-4 rounded-3xl backdrop-blur-sm shadow-lg pb-4"}>
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5}}
                >
                    <img src={"/images/person-bg-ho.webp"} alt={"Person sits, listen to music"}
                         className={"w-full object-cover rounded-tremor-default rounded-bl-none"}/>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: -25}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                >
                    <div className={"text-right my-16 m-2"}>
                        <Title className={"text-7xl text-tremor-brand font-black tracking-tight drop-shadow-sm"}>
                            מי שישמע!</Title>

                        <Text className={"text-lg font-semibold mt-6"}>
                            גם אתם מאלו שמזהים את השיר בשניה הראשונה שהוא מתנגן?
                            <br/>
                            בואו להוכיח את זה לכם ולחברים שלכם!
                        </Text>
                    </div>
                </motion.div>

                <div className={"flex gap-4 mb-14 mx-10 items-center"}>
                    <TextInput
                        value={id}
                        onValueChange={setId}
                        placeholder={"הדבק כאן מזהה חדר..."}
                        className={"h-12 text-xl"}
                        type={"number"}
                        autoFocus
                    />
                    <Link href={`/room/${id}`}>
                        <Button size={"xs"} disabled={!id} variant={"secondary"} className={"px-6 h-12"}>
                            <Icon icon={RiArrowLeftLine}/>
                        </Button>
                    </Link>
                </div>

                <div className={"grid grid-cols-2 md:grid-cols-3 gap-4 m-2"}>
                    <motion.div
                        className={"self-end justify-self-end"}
                        initial={{opacity: 0, y: -25}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5}}
                    >
                        <Image className={"rotate-y-person"}
                               src={"/images/person.png"} width={100} height={100} alt={""}/>
                    </motion.div>
                    <Link href={"/room"} className={"col-start-2 col-span-1"}>
                        <motion.div
                            initial={{opacity: 0, x: -25}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.5}}
                        >
                            <Card
                                className={"relative py-10 rounded-br-none hover:bg-tremor-brand-muted/90 bg-tremor-brand-muted flex flex-col " +
                                    "text-white justify-evenly items-center gap-2 text-center shadow-lg" +
                                    "transition-colors"}>
                                <Icon icon={RiMedal2Fill} size={"xl"}
                                      className={"absolute -top-1/4 rounded-full bg-white shadow-inner"}/>
                                <Text className={"text-white text-lg tracking-wide"}>
                                    צרו חדר והתחרו עם החברים!
                                </Text>
                                <div className={"h-10 w-10 border-b-4 border-r-4 border-tremor-brand-emphasis " +
                                    "absolute bottom-1 right-1"}/>
                            </Card>
                        </motion.div>
                    </Link>

                    <Link href={"/contribute"}>
                        <motion.div
                            className={"h-full"}
                            initial={{opacity: 0, x: 25}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.5}}
                        >
                            <Card
                                className={"w-full h-full relative shadow-inner rounded-tl-none hover:bg-tremor-brand-faint/85 bg-tremor-brand-faint text-center " +
                                    "flex-col flex justify-evenly items-center relative"}>
                                <Icon icon={RiMusicLine} size={"xl"} color={"white"}
                                      className={"rounded-full shadow-lg bg-tremor-brand-emphasis"}/>
                                <Text className={"font-bold tracking-tight"}>
                                    הכניסו לתחרות את השירים האהובים עליכם!
                                </Text>

                                <div className={"h-10 w-10 border-t-4 border-l-4 border-tremor-brand-emphasis " +
                                    "absolute top-1 left-1"}/>
                            </Card>
                        </motion.div>
                    </Link>

                    <motion.div
                        initial={{opacity: 0, y: 25}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5}}
                    >
                        <img src={"/images/logo-bg.png"} className={"rounded-tremor-default shadow-inner"}/>
                    </motion.div>
                    <Button>
                        התחברו
                    </Button>
                    <Button variant={"secondary"}>
                        אודות
                    </Button>
                </div>


                {/*<CreateRoom/>*/}
            </div>
        </div>
    );
}

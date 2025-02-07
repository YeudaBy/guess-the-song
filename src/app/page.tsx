"use client"

import {Button, Card, Icon, Text, Title} from "@tremor/react";
import {RiMedal2Fill, RiMusicLine} from "@remixicon/react";
import Link from "next/link";
import {motion} from "framer-motion";

export default function Home() {
    return (
        <div className={""}>
            <div className={"m-4 rounded-3xl backdrop-blur-sm shadow-lg pb-4"}>
                <img src={"/images/person-bg-ho.webp"} alt={"Person sits, listen to music"}
                     className={"w-full object-cover rounded-tremor-default rounded-bl-none"}/>

                <div className={"text-right my-14 m-2"}>
                    <Title className={"text-7xl text-tremor-brand font-extrabold tracking-tight drop-shadow-sm"}>
                        מי שישמע!</Title>

                    <Text className={"text-md"}>
                        נכון אתם מאלו שמזהים את השיר בשניה הראשונה שהוא מתנגן?
                        <br/>
                        בואו להוכיח את זה לכם ולחברים שלכם!
                    </Text>
                </div>

                <div className={"grid grid-cols-2 md:grid-cols-3 gap-4 items-start m-2"}>
                    <Link href={"/room"} className={"col-start-2 col-span-2"}>

                        <motion.div
                            initial={{opacity: 0, x: -25}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.5}}
                        >
                            <Card
                                className={"relative rounded-br-none hover:bg-tremor-brand-muted/90 bg-tremor-brand-muted flex flex-col " +
                                    "text-white justify-evenly items-center gap-2 text-center shadow-lg" +
                                    "transition-colors"}>
                                <Icon icon={RiMedal2Fill} size={"xl"}
                                      className={"absolute -top-1/3 rounded-full bg-white shadow-inner"}/>
                                <Text className={"text-white text-lg tracking-wide underline"}>
                                    צרו חדר והתחרו עם החברים!
                                </Text>
                            </Card>
                        </motion.div>
                    </Link>

                    <Link href={"/contribute"}>
                        <motion.div
                            initial={{opacity: 0, x: 25}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.5}}
                        >
                            <Card
                                className={"w-full shadow-inner rounded-tl-none hover:bg-tremor-brand-faint/85 bg-tremor-brand-faint text-center " +
                                    "flex-col flex justify-evenly items-center relative"}>
                                <Icon icon={RiMusicLine} size={"xl"} color={"white"}
                                      className={"absolute -top-1/4 rounded-full shadow-lg bg-tremor-brand-emphasis"}/>
                                <Text className={"text-lg underline"}>
                                    הכניסו לתחרות את השירים האהובים עליכם :)
                                </Text>
                            </Card>
                        </motion.div>
                    </Link>

                    <motion.div
                        className={"col-span-2"}
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

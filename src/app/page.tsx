import React from "react";
import {HomePageContent} from "@/app/HomePage";
import {Viewport} from "next";

export default function HomePage() {
    return <HomePageContent/>
}

export const viewport: Viewport = {
    themeColor: '#a008b3',
}

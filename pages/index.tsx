import { NextPage } from 'next'
import dynamic from 'next/dynamic';
import Home from "@components/views/Main";

// const HomeView = dynamic<NextPage>(() => import("@components/views/Home"), {
//   ssr: false
// })

export default Home
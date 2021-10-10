import { NextPage } from 'next'
import dynamic from 'next/dynamic'

const HomeView = dynamic<NextPage>(() => import("@components/views/Home"), {
  ssr: false
})

export default HomeView
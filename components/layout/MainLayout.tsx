import React from 'react'
import Navbar from '../Navbar'
import CartPanel from '../cart/CartPanel'
import CartButton from '../cart/CartButton'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className='bg-gray-900 text-white min-h-screen'>
      <Navbar />
      <CartButton />
      <CartPanel />
      <main className='pt-20'>{children}</main>
    </div>
  )
}

export default MainLayout

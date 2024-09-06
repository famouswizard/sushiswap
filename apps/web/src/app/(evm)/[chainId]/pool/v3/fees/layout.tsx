import { Container } from '@sushiswap/ui'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col flex-1 py-10 h-full">
      <Container maxWidth="5xl" className="px-4">
        {children}
      </Container>
    </section>
  )
}

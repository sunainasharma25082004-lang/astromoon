import { HeroSection, LiveAstrologers, DailyHoroscope, FreeServices, ShopSection, Testimonials, BlogSection, FAQ, CTASection } from '../../components/home';

export function HomePage() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <LiveAstrologers />
      <DailyHoroscope />
      <FreeServices />
      <ShopSection />
      <Testimonials />
      <BlogSection />
      <FAQ />
      <CTASection />
    </div>
  );
}

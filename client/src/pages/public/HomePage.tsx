import { HeroSection, LiveAstrologers, DailyHoroscope, FreeServices, ShopSection, Testimonials, BecomeAstrologerSection, FAQ, CTASection } from '../../components/home';

export function HomePage() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <LiveAstrologers />
      <DailyHoroscope />
      <FreeServices />
      <ShopSection />
      <Testimonials />
      <BecomeAstrologerSection />
      <FAQ />
      <CTASection />
    </div>
  );
}

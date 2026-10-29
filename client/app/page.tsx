import CTA from "@/components/cta/cta";
import Gallery from "@/components/gallery/gallery";
import Hero from "@/components/hero/hero";
import Partners from "@/components/partners/partners";
import Registrations from "@/components/registrations/registrations";
import Reviews from "@/components/reviews/reviews";
import Winners from "@/components/winners/winners";
import Laureates from "@/components/laureates/laureates";
import directus from "@/lib/directus";
import { CtaSection, HeroSection, PartnersSection, RegistrationsSection, ReviewsSection } from "@/lib/schema";
import { readSingleton } from "@directus/sdk";
import { Metadata } from 'next';

export const revalidate = 10

export async function generateMetadata(): Promise<Metadata> {
  const data = await directus.request(readSingleton('meta_data'));

  const ogImageUrl = data.og_image
    ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${data.og_image}`
    : '/static/og-image.jpg';

  return {
    title: data.title,
    description: data.description,
    metadataBase: new URL(data.site_url || 'https://catering-awards.ru'),

    openGraph: {
      title: data.og_title || data.title,
      description: data.og_description || data.description,
      url: './',
      siteName: 'Премия «Кейтеринг года»',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: data.og_title || data.title,
      description: data.og_description || data.description,
      images: [ogImageUrl],
    },
  };
}

export default async function HomePage() {
  const [heroData, registrationsData, winnersData, laureatesData, galleryData, reviewsData, partnersData, ctaData] = await Promise.all([
    directus.request(readSingleton('hero_section', {
      fields: ['*', 'form.*'] as any
    })),
    directus.request(readSingleton('registrations_section', {
      fields: ['*', 'guests_form.*', 'nominees_form.*'] as any
    })),
    directus.request(readSingleton('winners_section')),
    directus.request(readSingleton('laureates_section')),
    directus.request(readSingleton('gallery_section')),
    directus.request(
      readSingleton('reviews_section', {
        fields: ['*', 'reviews.*'] as any
      })
    ),
    directus.request(
      readSingleton('partners_section', {
        fields: [
          '*',
          'categories.*',
          'categories.item:partner_categories.*',
          'categories.item:partner_categories.partners.*'
        ] as any
      })
    ),
    directus.request(readSingleton('cta_section', {
      fields: ['*', 'form.*'] as any
    }))
  ]);

  return (
    <main>
      <Hero {...heroData as unknown as HeroSection} />
      <Registrations {...(registrationsData as unknown as RegistrationsSection)} />
      <Winners {...winnersData} />
      <Laureates {...laureatesData} />
      <Gallery {...galleryData} />
      <Reviews {...(reviewsData as unknown as ReviewsSection)} />
      <Partners {...(partnersData as unknown as PartnersSection)} />
      <CTA {...(ctaData as unknown as CtaSection)} />
    </main>
  );
}

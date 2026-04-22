import type { DirectusFile } from "@directus/sdk";

export interface Schema {
    cta_section: CtaSection;
    footer_section: FooterSection;
    gallery_section: GallerySection;
    hero_section: HeroSection;
    meta_data: MetaData;
    partner_categories: PartnerCategory[];
    partners: Partner[];
    partners_section: PartnersSection;
    partners_section_categories: PartnerSectionCategory[];
    registrations_section: RegistrationsSection;
    reviews_section: ReviewsSection;
    winners_section: WinnersSection;
    directus_deployments: CustomDirectusDeployment;
}

export interface CtaSection {
    id: number;
    title: string | null;
    text: string | null;
    button_text: string | null;
    button_link: string | null;
}

export interface FooterSection {
    id: number;
    title: string | null;
    description: string | null;
    copyright: string | null;
    navigation: FooterLink[] | null;
    contacts: FooterLink[] | null;
}

export interface PartnerCategory {
    id: number;
    sort: number | null;
    title: string | null;
    partners: number[] | Partner[];
}

export interface Partner {
    id: number;
    sort: number | null;
    name: string | null;
    link: string | null;
    logo_image: string | DirectusFile<Schema> | null;
    is_colored: boolean | null;
    category: number | PartnerCategory | null;
}

export interface PartnersSection {
    id: number;
    title: string | null;
    categories: number[] | PartnerSectionCategory[];
}

export interface PartnerSectionCategory {
    id: number;
    partners_section_id: number | PartnersSection | null;
    item: string | PartnerCategory | null;
    collection: string | "partner_categories" | null;
}

export interface ReviewsSection {
    id: number;
    title: string | null;
    subtitle: string | null;
    reviews: ReviewItem[] | null;
}

export interface GallerySection {
    id: number;
    title: string | null;
    subtitle: string | null;
    photos: GalleryPhotos[] | null;
}

export interface HeroSection {
    id: number;
    modal_image: string | DirectusFile<Schema> | null;
    modal_title: string | null;
    modal_text: string | null;
    modal_goals_title: string | null;
    modal_goals_list: Goals[] | null;
    logotype: string | DirectusFile<Schema> | null;
    title_up: string | null;
    title_down: string | null;
    description: string | null;
    modal_button: string | null;
    registration_button: string | null;
    registration_link: string | null;
}

export interface MetaData {
    id: number;
    title: string;
    description: string;
    og_title: string;
    og_description: string;
    og_image: string | DirectusFile<Schema> | null;
    site_url: string;
}

export interface RegistrationsSection {
    id: number;
    nominees_icon: string;
    nominees_subtitle: string | null;
    nominees_title: string | null;
    nominees_text: string | null;
    nominees_advantages: RegistrationsAdvantages[] | null;
    nominees_button: string | null;
    nominees_link: string | null;
    guests_icon: string;
    guests_subtitle: string | null;
    guests_title: string | null;
    guests_text: string | null;
    guests_advantages: RegistrationsAdvantages[] | null;
    guests_button: string | null;
    guests_link: string | null;
}

export interface WinnersSection {
    id: number;
    title: string | null;
    subtitle: string | null;
    icon: string;
    year: number | null;
    description: string | null;
    intro_text: string | null;
    special_nomination: string | null;
    categories: WinnersCategories[] | null;
    file: string | DirectusFile<Schema> | null;
}

export interface CustomDirectusDeployment {
    webhook_secret: string | null;
}

// GeoJSON Types

export interface GeoJSONPoint {
    type: "Point";
    coordinates: [number, number];
}

export interface GeoJSONLineString {
    type: "LineString";
    coordinates: Array<[number, number]>;
}

export interface GeoJSONPolygon {
    type: "Polygon";
    coordinates: Array<Array<[number, number]>>;
}

export interface GeoJSONMultiPoint {
    type: "MultiPoint";
    coordinates: Array<[number, number]>;
}

export interface GeoJSONMultiLineString {
    type: "MultiLineString";
    coordinates: Array<Array<[number, number]>>;
}

export interface GeoJSONMultiPolygon {
    type: "MultiPolygon";
    coordinates: Array<Array<Array<[number, number]>>>;
}

export interface GeoJSONGeometryCollection {
    type: "GeometryCollection";
    geometries: Array<
        | GeoJSONPoint
        | GeoJSONLineString
        | GeoJSONPolygon
        | GeoJSONMultiPoint
        | GeoJSONMultiLineString
        | GeoJSONMultiPolygon
    >;
}

// Дополнения

export interface Goals {
    icon: string;
    text: string | null;
}

export interface RegistrationsAdvantages {
    text: string | null;
}

export interface WinnersCategories {
    nomination: string | null;
    company: string | null;
}

export interface GalleryPhotos {
    year: number | null;
    title: string | null;
    link: string | null;
}

export interface ReviewItem {
    text: string | null;
    name: string | null;
    company: string | null;
    city: string | null;
}

export interface FooterLink {
    label: string;
    url: string;
}
import type { DirectusFile } from "@directus/sdk";

export interface Schema {
    hero_section: HeroSection;
    meta_data: MetaData;
    directus_deployments: CustomDirectusDeployment;
}

export interface HeroSection {
    id: number;
    modal_image: string | DirectusFile<Schema> | null;
    modal_title: string | null;
    modal_text: string | null;
    modal_goals_title: string | null;
    modal_goals_list: Goals[] | null;
    logotype: string | DirectusFile<Schema> | null;
}

export interface MetaData {
    id: number;
    title: string | null;
    description: string | null;
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
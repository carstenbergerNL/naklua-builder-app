/**
 * Page represents a single page in the builder application.
 * Includes metadata, layout, and configuration fields.
 */
export interface Page {
    id: string;
    appInstanceId: string;
    name: string;
    title: string;
    documentation: string;
    url: string;
    platform: string;
    layoutType: string;
    layout: string;
    jsonDefinition: string;
    pageParameters: string; // JSON string
    pageType: string;
    visibilityRules: string; // JSON string
    onLoadAction: string;
    canvasWidth: number;
    canvasHeight: number;
    isHomePage: boolean;
    isPublished: boolean;
    orderIndex: number;
    parentId?: string | null;
    creatorId?: string;
    createdAt: string;
    updaterId?: string;
    updatedAt?: string | null;
  }
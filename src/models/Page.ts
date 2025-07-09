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
    creatorId?: string;
    createdAt: string;
    updaterId?: string;
    updatedAt?: string | null;
  }
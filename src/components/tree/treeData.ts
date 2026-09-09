export interface TreeNodeData {
  label: string;
  key: string;
  children?: TreeNodeData[];
}

export const opticalTree: TreeNodeData = {
  label: "Optical Instrument",
  key: "root",
  children: [
    { label: "Projector", key: "projector" },
    {
      label: "Camera",
      key: "camera",
      children: [
        { label: "Pinhole", key: "pinhole" },
        { label: "Lens", key: "lens" },
      ],
    },
    {
      label: "Microscope",
      key: "microscope",
      children: [
        { label: "Simple", key: "simple" },
        { label: "Compound", key: "compound" },
      ],
    },
    {
      label: "Telescope",
      key: "telescope",
      children: [
        {
          label: "Astronomical",
          key: "astronomical",
          children: [
            { label: "Refracting", key: "refracting" },
            { label: "Reflecting", key: "reflecting" },
            { label: "Infrared", key: "infrared" },
          ],
        },
        {
          label: "Terrestrial",
          key: "terrestrial",
          children: [
            { label: "Galilean", key: "galilean" },
            { label: "Binocular", key: "binocular" },
          ],
        },
      ],
    },
  ],
};

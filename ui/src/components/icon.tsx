import React from "react"

type IconProps = {
  className?: string
  width: string
  height: string
}

const icons: Record<string, React.FC<IconProps>> = {
  offline: (props: IconProps) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 15C24 12.36 21.95 10.22 19.35 10.04C18.67 6.59 15.64 4 12 4C10.67 4 9.42998 4.36 8.34998 4.97L9.83998 6.46C10.51 6.17 11.23 6 12 6C15.04 6 17.5 8.46 17.5 11.5V12H19C20.66 12 22 13.34 22 15C22 15.99 21.52 16.85 20.79 17.4L22.2 18.81C23.29 17.89 24 16.54 24 15ZM3.70998 4.56C3.31998 4.95 3.31998 5.58 3.70998 5.97L5.76998 8.03H5.34998C2.06998 8.38 -0.410016 11.37 0.0599837 14.82C0.459984 17.84 3.18998 20 6.21998 20H17.73L19.02 21.29C19.41 21.68 20.04 21.68 20.43 21.29C20.82 20.9 20.82 20.27 20.43 19.88L5.11998 4.56C4.72998 4.17 4.09998 4.17 3.70998 4.56ZM5.99998 18C3.78998 18 1.99998 16.21 1.99998 14C1.99998 11.79 3.78998 10 5.99998 10H7.72998L15.73 18H5.99998Z"
        fill="currentColor"
      />
    </svg>
  ),
  container: (props: IconProps) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2_9581)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.0006 15.2696H3.9873V8.42006H4.00093C4.05191 8.12651 4.24575 7.87385 4.52302 7.75062L12.6491 4.13903C12.8829 4.0352 13.1493 4.0352 13.3831 4.13903L21.5092 7.75062C21.7872 7.87385 21.9812 8.12651 22.0322 8.42006H22.0452V8.55166L22.0454 8.56277L22.0455 8.57496C22.0455 8.58275 22.0454 8.59051 22.0452 8.59826V15.2696H22.0319C22.0407 15.3201 22.0452 15.3719 22.0452 15.4243C22.0452 15.4408 22.0448 15.4571 22.0439 15.4734C22.0256 15.8111 21.8199 16.1109 21.5089 16.2495L13.3828 19.8611C13.2655 19.9126 13.1409 19.9388 13.0162 19.9388C12.8907 19.9388 12.7662 19.9126 12.6488 19.8611L4.52272 16.2495C4.21905 16.1137 4.01546 15.8235 3.99 15.4944C3.98821 15.4712 3.9873 15.4478 3.9873 15.4243C3.9873 15.3719 3.99184 15.3201 4.0006 15.2696H4.0006ZM20.3095 9.08385C20.5944 9.05898 20.8293 9.2508 20.8342 9.51229L20.9388 15.0862C20.9437 15.3477 20.7167 15.5799 20.4318 15.6048C20.1469 15.6296 19.9119 15.4378 19.907 15.1763L19.8025 9.60234C19.7976 9.34086 20.0246 9.10871 20.3095 9.08385ZM18.8495 10.1069C18.8446 9.84538 18.6096 9.65356 18.3248 9.67843C18.0399 9.7033 17.8129 9.93544 17.8178 10.1969L17.9223 15.7709C17.9272 16.0324 18.1622 16.2242 18.4471 16.1993C18.732 16.1745 18.959 15.9424 18.9541 15.6809L18.8495 10.1069ZM16.34 10.5336C16.6249 10.5088 16.8598 10.7006 16.8648 10.9621L16.9693 16.5361C16.9742 16.7976 16.7472 17.0297 16.4623 17.0546C16.1775 17.0794 15.9425 16.8876 15.9376 16.6261L15.833 11.0521C15.8281 10.7906 16.0551 10.5585 16.34 10.5336ZM14.8801 11.9586C14.8751 11.6971 14.6402 11.5053 14.3553 11.5302C14.0704 11.555 13.8434 11.7872 13.8483 12.0487L13.9529 17.6227C13.9577 17.8842 14.1927 18.076 14.4776 18.0511C14.7625 18.0262 14.9895 17.7941 14.9846 17.5326L14.8801 11.9586Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_2_9581">
          <rect
            width="18"
            height="18"
            fill="white"
            transform="translate(3.9873 3)"
          />
        </clipPath>
      </defs>
    </svg>
  ),
  "chevron-down": (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  more: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="12" cy="5" r="1"></circle>
      <circle cx="12" cy="19" r="1"></circle>
    </svg>
  ),
  "external-link": (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  ),
  info: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
  error: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  check: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  clipboard: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  ),
}

export default function Icon(props: {
  name: keyof typeof icons
  className?: string
  size: string
}) {
  const { name, size, ...rest } = props
  const Icon = icons[name]
  return <Icon {...rest} width={size} height={size} />
}

Icon.defaultProps = {
  size: "24",
}

import { GuestLayoutWrapper } from "@/shared/components/layout/server/GuestLayoutWrapper/GuestLayoutWrapper";


export default function GuestLayout({ children }: LayoutProps<"/">) {
  return <GuestLayoutWrapper>{children}</GuestLayoutWrapper>;
}
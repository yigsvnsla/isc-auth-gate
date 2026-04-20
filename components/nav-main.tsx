import { ChevronRight, Home, Plus, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger
                className={"data-[state=open]:rotate-90"}
                render={
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>

                    <ChevronRight className="data-[state=open]:rotate-90 ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                }
              />
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        render={
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        }
                      />
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// <SidebarMenu>
//   {items.map((item) => (
//     <Collapsible key={item.title} defaultOpen={item.isActive}>
//       <SidebarMenuItem>
//         <SidebarMenuButton tooltip={item.title}>
//           {/* <Link href={item.url}> */}
//           <item.icon />
//           <span className="capitalize">{item.title}</span>
//           {/* </Link> */}
//         </SidebarMenuButton>
//         {item.items?.length ? (
//           <>
//             <CollapsibleTrigger>
//               {/* <SidebarMenuAction className="data-[state=open]:rotate-90"> */}
//               <ChevronRight />
//               <span className="sr-only">Toggle</span>
//               {/* </SidebarMenuAction> */}
//             </CollapsibleTrigger>
//             <CollapsibleContent>
//               <SidebarMenuSub>
//                 {item.items?.map((subItem) => (
//                   <SidebarMenuSubItem key={subItem.title}>
//                     {/* <SidebarMenuSubButton  isActive> */}
//                     {/* <Link href={subItem.url}> */}
//                     <span className="capitalize">{subItem.title}</span>
//                     {/* </Link> */}
//                     {/* </SidebarMenuSubButton> */}
//                   </SidebarMenuSubItem>
//                 ))}
//               </SidebarMenuSub>
//             </CollapsibleContent>
//           </>
//         ) : null}
//       </SidebarMenuItem>
//     </Collapsible>
//   ))}
// </SidebarMenu>

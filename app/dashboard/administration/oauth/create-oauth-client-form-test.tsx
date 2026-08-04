// import { FC, PropsWithChildren } from "react";
// import { useFormContext } from "react-hook-form";
// import { CreateOAuthClientData } from "./create-oauth-client-schema";
// import { CreateOauthClientFormHeader } from "./create-oauth-client-form-header";

// export const FormCreateOauthClient: FC<PropsWithChildren> = ({ children }) => {
//   const {
//     control,
//     setValue,
//     formState: { dirtyFields },
//   } = useFormContext<CreateOAuthClientData>();

//   const onSubmit = (data: CreateOAuthClientData) => {
//     // Handle form submission logic here
//     console.log("Form submitted with data:", data);
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       <CreateOauthClientFormHeader />
//       <form
//         // onSubmit={form.handleSubmit(onSubmit)}
//         className="mx-auto w-full max-w-6xl"
//       >
//         {children}
//       </form>
//     </div>
//   );
// };

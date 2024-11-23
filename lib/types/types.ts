import * as z from "zod";

export interface FormDataType {
  UserName?: string;
  TwitterProfile?: string;
  EmailAddress?: string;
  NexusType?: string;
}

export interface buttonType {
  title: string;
  icon: React.JSX.Element;
}

export interface CardAnimationType {
  className?: string;
  children: any;
}

export interface CardType {
  children?: any;
  className?: string;
  width?: any;
}

export interface NavigationType {
  name: string;
  link: string;
  icon?: React.JSX.Element;
  current?: boolean;
}

export const OnboardingScreenForm = z.object({
  username: z
    .string({
      required_error: "username is required",
      invalid_type_error: "username must be a string",
    })
    .min(3, "username should not be less than 3 characters")
    .max(20, "username should not be more that 20 characters"),

  twitterProfile: z
    .string({
      required_error: "twitter profile is required",
    })
    .min(1, "Twitter profile url is required")
    .url(),

  email: z
    .string({
      required_error: "email is required",
    })
    .min(1, "Email is required")
    .email(),

  image: z.any(),
});
export type OnboardingScreenForm = z.infer<typeof OnboardingScreenForm>;

export interface ApproveModalType {
  title: string;
  client?: string;
  contractor?: string;
  amount?: number;
  messageTitle: string;
  messageDescription?: any;
  children?: any;
}

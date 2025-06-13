import type { ActionFunctionArgs } from "react-router";

export interface ActionArgs extends ActionFunctionArgs {}

export interface ActionData {
  error?: string;
}
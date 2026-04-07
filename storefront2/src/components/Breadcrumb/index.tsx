import Link from "next/link";
import { ArrowRightIcon } from "@/components/Icons";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Caminho" className="breadcrumb">
      <ol className="breadcrumb__list" role="list">
        <li className="breadcrumb__item">
          <Link href="/" className="breadcrumb__link link">Início</Link>
          <ArrowRightIcon className="w-3 h-3 inline-block mx-1" />
        </li>
        {items.map((item, index) => (
          <li key={index} className="breadcrumb__item">
            {item.href && index < items.length - 1 ? (
              <>
                <Link href={item.href} className="breadcrumb__link link">{item.label}</Link>
                <ArrowRightIcon className="w-3 h-3 inline-block mx-1" />
              </>
            ) : (
              <span className="breadcrumb__link" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

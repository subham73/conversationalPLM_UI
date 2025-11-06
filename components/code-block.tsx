'use client';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const match = /language-(\w+)/.exec(className || "");
  if (!inline) {
    return match ? (      
    <pre className="bg-gray-100 text-black text-sm w-full overflow-x-auto px-4 py-2">
      <code className="whitespace-pre-wrap break-words font-mono">
        {children}
      </code>
    </pre>
    ) : (
      <code className="bg-gray-200 text-black px-1 py-0.5 rounded font-sans">
        {children}
      </code>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}

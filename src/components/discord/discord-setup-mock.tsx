"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { discordSetupExamples, type DiscordChannel, type DiscordEmbed, type DiscordSetupExample } from "@/data/discord-setup-examples";
import { DiscordMarkdown } from "./discord-markdown";
import styles from "./discord-setup.module.css";

const memberNames = [
  "moth", "pip", "fuji", "ao", "suisen", "ceefore", "ink", "ember", "signal", "rowan", "kiwi", "nova",
];

function findChannel(example: DiscordSetupExample, id: string): DiscordChannel | undefined {
  for (const category of example.categories) {
    const channel = category.channels.find((item) => item.id === id);
    if (channel) return channel;
  }
  return undefined;
}

function HashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" fillRule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.18 8H2.99a1 1 0 0 0 0 2h4.8l-.9 5H1a1 1 0 1 0 0 2h5.18l-.8 4.16a1 1 0 0 0 1.97.32L8.82 17h5.97l-.8 4.16a1 1 0 0 0 1.97.32l.8-4.16h5.06a1 1 0 0 0 0-2h-4.8l.9-5h5.06a1 1 0 0 0 0-2h-4.8l.8-4.16a1 1 0 1 0-1.97-.32L14.18 8H8.2l.8-4.16ZM14.2 15H8.22l.9-5h5.98l-.9 5Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path fill="currentColor" d="M6.5 8.5 10 5H3l3.5 3.5Z" />
    </svg>
  );
}

function DropdownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />
    </svg>
  );
}

function BotCheck() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-4.47-1.06a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l1.47 1.47 3.47-3.47a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
}

function HomeGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 3.2 3.5 10.2V21h5.2v-5.5h6.6V21h5.2V10.2L12 3.2Z" />
    </svg>
  );
}

function EmbedCard({ embed, embedStyle }: { embed: DiscordEmbed; embedStyle: DiscordSetupExample["embedStyle"] }) {
  const hasBody = Boolean(embed.title || embed.description || embed.fields?.length || embed.thumbnail || embed.image);

  return (
    <div className={styles.post} data-embed-style={embedStyle}>
      {embed.content ? (
        <p className={styles.messageText}>
          <DiscordMarkdown text={embed.content} />
        </p>
      ) : null}

      {hasBody ? (
        <div className={styles.embed} style={{ ["--embed-color" as string]: embed.color }}>
          <div className={styles.embedGrid}>
            <div className={styles.embedMain}>
              {embed.author ? (
                <div className={styles.embedAuthor}>
                  {embed.author.icon ? (
                    <Image src={embed.author.icon} alt="" width={24} height={24} className={styles.embedAuthorIcon} />
                  ) : null}
                  <span>{embed.author.name}</span>
                </div>
              ) : null}

              {embed.title ? (
                embed.url ? (
                  <a className={styles.embedTitleLink} href={embed.url} onClick={(event) => event.preventDefault()}>
                    {embed.title}
                  </a>
                ) : (
                  <h3 className={styles.embedTitle}>{embed.title}</h3>
                )
              ) : null}

              {embed.description ? (
                <p className={styles.embedBody}>
                  <DiscordMarkdown text={embed.description} />
                </p>
              ) : null}

              {embed.fields && embed.fields.length > 0 ? (
                <div className={styles.fields}>
                  {embed.fields.map((field) => (
                    <div
                      key={field.name}
                      className={`${styles.field} ${field.inline === false ? styles.fieldFull : ""}`}
                    >
                      <p className={styles.fieldName}>
                        <DiscordMarkdown text={field.name} />
                      </p>
                      <p className={styles.fieldValue}>
                        <DiscordMarkdown text={field.value} />
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {embed.thumbnail ? (
              <Image
                src={embed.thumbnail}
                alt=""
                width={80}
                height={80}
                className={styles.embedThumb}
              />
            ) : null}
          </div>

          {embed.image ? (
            <div className={styles.embedImageWrap}>
              <Image src={embed.image} alt="" width={720} height={400} className={styles.embedImage} />
            </div>
          ) : null}

          {embed.footer || embed.timestamp ? (
            <div className={styles.embedFooter}>
              {embed.footer?.icon ? (
                <Image src={embed.footer.icon} alt="" width={20} height={20} className={styles.embedFooterIcon} />
              ) : null}
              <span>
                {embed.footer?.text}
                {embed.footer?.text && embed.timestamp ? " • " : null}
                {embed.timestamp}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {embed.reactions && embed.reactions.length > 0 ? (
        <div className={styles.reactions} aria-label="Reactions">
          {embed.reactions.map((reaction) => (
            <span key={reaction.emoji} className={styles.reaction}>
              <span aria-hidden="true">{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DiscordSetupMock({
  example,
  onSelectExample,
}: {
  example: DiscordSetupExample;
  onSelectExample?: (slug: string) => void;
}) {
  const [channelId, setChannelId] = useState(example.defaultChannel);

  useEffect(() => {
    setChannelId(example.defaultChannel);
  }, [example.slug, example.defaultChannel]);

  const channel = useMemo(
    () => findChannel(example, channelId) ?? findChannel(example, example.defaultChannel),
    [example, channelId],
  );

  const memberGroups = useMemo(() => {
    let nameIndex = 0;
    return example.roles.map((role, roleIndex) => {
      const count = roleIndex < 2 ? 1 : roleIndex < 4 ? 2 : 1;
      const people = Array.from({ length: count }, () => {
        const name = memberNames[nameIndex % memberNames.length];
        nameIndex += 1;
        return name;
      });
      return { role, people };
    });
  }, [example.roles]);

  if (!channel) return null;

  return (
    <div className={styles.shell}>
      <div
        className={styles.mock}
        data-naming={example.embedStyle}
        data-embed-style={example.embedStyle}
        style={{ ["--server-accent" as string]: example.accent }}
        aria-label={`${example.name} Discord layout demo`}
      >
        <nav className={styles.rail} aria-label="Servers">
          <div className={`${styles.railBtn} ${styles.railHome}`} aria-hidden="true">
            <HomeGlyph />
          </div>
          <div className={styles.railDivider} aria-hidden="true" />
          {discordSetupExamples.map((item) => (
            <button
              key={item.slug}
              type="button"
              className={styles.railBtn}
              aria-current={item.slug === example.slug ? "true" : undefined}
              aria-label={item.name}
              title={item.name}
              style={item.slug === example.slug ? undefined : { ["--server-accent" as string]: item.accent }}
              onClick={() => onSelectExample?.(item.slug)}
            >
              <span className={styles.railPill} aria-hidden="true" />
              <span className={styles.railGlyph}>{item.serverIcon}</span>
            </button>
          ))}
        </nav>

        <aside className={styles.sidebar}>
          <div className={styles.serverHead}>
            <span>{example.name}</span>
            <DropdownIcon />
          </div>
          {example.banner ? (
            <div className={styles.serverBanner}>
              <Image src={example.banner} alt="" fill sizes="240px" className={styles.serverBannerImg} />
            </div>
          ) : null}
          <div className={styles.channels}>
            {example.categories.map((category) => (
              <div key={category.name} className={styles.category}>
                <div className={styles.categoryBtn}>
                  <ChevronIcon />
                  {category.name}
                </div>
                {category.channels.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.channel}
                    aria-current={item.id === channel.id ? "true" : undefined}
                    onClick={() => setChannelId(item.id)}
                  >
                    <HashIcon />
                    <span className={styles.channelName}>{item.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        <section className={styles.main} aria-label={channel.name}>
          <header className={styles.channelHead}>
            <HashIcon className={styles.channelHeadIcon} />
            <span className={styles.channelTitle}>{channel.name}</span>
            {channel.topic ? (
              <>
                <span className={styles.topicDivider} aria-hidden="true" />
                <p className={styles.topic}>{channel.topic}</p>
              </>
            ) : null}
          </header>

          <div className={styles.messages}>
            {channel.embeds.length === 0 ? (
              <div className={styles.empty}>
                <strong>{channel.name}</strong>
                <span>This is the start of the channel. No pinned posts in this demo view.</span>
              </div>
            ) : (
              channel.embeds.map((embed, index) => (
                <article key={`${channel.id}-${index}`} className={styles.message}>
                  <div className={styles.avatar} aria-hidden="true">
                    <Image src="/assets/logos/mark.png" alt="" width={40} height={40} className={styles.avatarImg} />
                  </div>
                  <div className={styles.messageBody}>
                    <div className={styles.metaLine}>
                      <span className={styles.author}>Scriptmoth</span>
                      <span className={styles.botTag}><BotCheck />APP</span>
                      <span className={styles.stamp}>{embed.timestamp ?? "Today at 4:20 PM"}</span>
                    </div>
                    <EmbedCard embed={embed} embedStyle={example.embedStyle} />
                  </div>
                </article>
              ))
            )}
          </div>

          <div className={styles.composer} aria-hidden="true">
            <span>Message {channel.name}</span>
          </div>
        </section>

        <aside className={styles.members} aria-label="Members">
          {memberGroups.map(({ role, people }) => (
            <div key={role.name} className={styles.memberGroup}>
              <p className={styles.memberHead}>
                {role.name} — {people.length}
              </p>
              {people.map((name) => (
                <div
                  key={`${role.name}-${name}`}
                  className={styles.member}
                  style={{ ["--member-color" as string]: role.color }}
                >
                  <div className={styles.memberAvatar} aria-hidden="true">
                    <span className={styles.status} />
                  </div>
                  <span className={styles.memberName}>{name}</span>
                </div>
              ))}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

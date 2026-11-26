-- CCT content migration: the full CCT question bank, the Genesis Bible Journey
-- lessons as Faith Quests, and the Bible Journey review questions as a quiz pack.
-- All of it is Champzz default content (organization_id null), faith mode only.
-- Choices are shuffled here because some CCT sources listed the answer first.

do $$
declare p uuid; qid uuid;
begin
  insert into public.question_packs (name, faith) values ('Bible Basics', true) returning id into p;
  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (p, 1, 'Who built a big boat to survive the flood?', array['Abraham', 'Noah', 'Moses', 'David'], 1, 'Genesis 6-9 tells the story of Noah and the ark.'),
  (p, 1, 'Who was swallowed by a big fish?', array['Elijah', 'Peter', 'Daniel', 'Jonah'], 3, 'Jonah spent three days and three nights inside the fish! (Jonah 1:17)'),
  (p, 1, 'What did God create on the first day?', array['Light', 'The sun', 'People', 'Animals'], 0, 'Genesis 1:3 says "Let there be light." (Genesis 1:3-5)'),
  (p, 1, 'Who was the first man God created?', array['Seth', 'Noah', 'Cain', 'Adam'], 3, 'Genesis 2:7'),
  (p, 1, 'Baby Jesus was born in which town?', array['Jericho', 'Bethlehem', 'Jerusalem', 'Nazareth'], 1, 'Luke 2:4-7'),
  (p, 1, 'Who is known as the "Good Shepherd"?', array['Jesus', 'Moses', 'David', 'John'], 0, 'John 10:11'),
  (p, 1, 'How many disciples did Jesus choose?', array['3', '7', '12', '10'], 2, 'Matthew 10:1-4'),
  (p, 1, 'Who was the first woman God created?', array['Sarah', 'Rebekah', 'Rachel', 'Eve'], 3, 'Genesis 2:22'),
  (p, 1, 'What is the first book of the Bible?', array['Psalms', 'Matthew', 'Exodus', 'Genesis'], 3, 'Genesis 1:1'),
  (p, 1, 'What is the last book of the Bible?', array['Revelation', 'Malachi', 'Jude', 'Acts'], 0, 'Revelation 22:21'),
  (p, 1, 'Who is called the Son of God?', array['John the Baptist', 'Moses', 'Jesus', 'Elijah'], 2, 'Matthew 3:17'),
  (p, 1, 'What do we call the special meal Jesus shared with His disciples the night before He died?', array['The Passover Feast', 'The First Supper', 'The Last Supper', 'The Wedding Feast'], 2, 'Luke 22:19-20'),
  (p, 1, 'Who was thrown in the fire but did not get burned, alongside two friends?', array['The three wise men', 'Shadrach, Meshach and Abednego', 'Daniel and his friends', 'Peter, James and John'], 1, 'Daniel 3'),
  (p, 1, 'Who is Jesus'' earthly mother?', array['Anna', 'Elizabeth', 'Mary', 'Martha'], 2, 'Luke 1:26-31'),
  (p, 1, 'What did the angel tell the shepherds about on the night Jesus was born?', array['Good news of great joy', 'A famine coming', 'A great flood', 'A new king in Rome'], 0, 'Luke 2:8-14'),
  (p, 1, 'What is the special day we celebrate when Jesus rose from the dead?', array['Easter', 'Christmas', 'Pentecost', 'Passover'], 0, 'Matthew 28:1-10'),
  (p, 1, 'Which animal spoke to a prophet named Balaam?', array['A dove', 'A snake', 'A donkey', 'A lion'], 2, 'Numbers 22:21-33'),
  (p, 2, 'What do we call the first five books of the Bible?', array['The Prophets', 'The Epistles', 'The Gospels', 'The Pentateuch (Law)'], 3, 'They are also called the Torah, and Moses is traditionally credited as their author. (Genesis-Deuteronomy)'),
  (p, 2, 'How many books are in the New Testament?', array['39', '66', '12', '27'], 3, 'New Testament (27 books)'),
  (p, 2, 'How many books are in the Old Testament?', array['12', '66', '27', '39'], 3, 'Old Testament (39 books)'),
  (p, 2, 'What do we call Jesus'' close followers who traveled with Him?', array['Priests', 'Prophets', 'Disciples', 'Kings'], 2, 'Matthew 10:1-4'),
  (p, 2, 'What did God rest on after making the world in six days?', array['The seventh day', 'The sixth day', 'The first day', 'The tenth day'], 0, 'Genesis 2:2-3'),
  (p, 2, 'Who is known for his great patience even after losing everything he had?', array['Jonah', 'Job', 'Jeremiah', 'Nehemiah'], 1, 'Job 1:20-22'),
  (p, 2, 'What is the name for God''s special promise or agreement with His people?', array['A covenant', 'A commandment', 'A parable', 'A psalm'], 0, 'Genesis 9:8-17'),
  (p, 2, 'Which prayer did Jesus teach His disciples to pray?', array['The Lord''s Prayer', 'The Psalm of David', 'The Beatitudes', 'The Shepherd''s Prayer'], 0, 'Matthew 6:9-13'),
  (p, 3, 'What language was most of the Old Testament originally written in?', array['Latin', 'Aramaic', 'Hebrew', 'Greek'], 2, 'Old Testament (Hebrew)'),
  (p, 3, 'What language was most of the New Testament originally written in?', array['Arabic', 'Greek', 'Latin', 'Hebrew'], 1, 'New Testament (Greek)'),
  (p, 3, 'What are the first four books of the New Testament called?', array['The Major Prophets', 'The Gospels', 'The Epistles', 'The Psalms'], 1, 'Matthew-John'),
  (p, 3, 'Which fruit is NOT listed among the "fruit of the Spirit" in Galatians?', array['Joy', 'Love', 'Wealth', 'Peace'], 2, 'Galatians 5:22-23 lists love, joy, peace, patience, kindness, goodness, faithfulness, gentleness and self-control.'),
  (p, 3, 'What does the word "gospel" mean?', array['Good news', 'Sacred law', 'Holy book', 'Song of praise'], 0, 'Mark 1:1'),
  (p, 3, 'Which Old Testament book is a collection of songs and prayers?', array['Proverbs', 'Psalms', 'Lamentations', 'Ecclesiastes'], 1, 'Psalm 1:1'),
  (p, 4, 'Who is traditionally credited with writing most of the Psalms?', array['Moses', 'Asaph', 'Solomon', 'David'], 3, 'Psalm 23 (title)'),
  (p, 4, 'What is the shortest verse in the Bible (in most English translations)?', array['"Pray without ceasing."', '"Rejoice always."', '"Jesus wept."', '"God is love."'], 2, 'It''s John 11:35, right before Jesus raises Lazarus from the dead.'),
  (p, 4, 'Which book of the Bible does not mention God by name even once?', array['Job', 'Esther', 'Jonah', 'Ruth'], 1, 'Esther 1:1'),
  (p, 4, 'What are the nine qualities listed in the "fruit of the Spirit" also known as?', array['The Beatitudes', 'The Ten Commandments', 'The gifts of the Spirit', 'The fruit of the Spirit'], 3, 'Galatians 5:22-23'),
  (p, 4, 'Which two Old Testament books are named after women?', array['Ruth and Naomi', 'Ruth and Esther', 'Deborah and Ruth', 'Esther and Sarah'], 1, 'Ruth 1:1; Esther 2:17'),
  (p, 5, 'Which Old Testament prophet''s book comes right before the New Testament?', array['Micah', 'Haggai', 'Zechariah', 'Malachi'], 3, 'Malachi 4:5-6'),
  (p, 5, 'What is the longest chapter in the entire Bible?', array['Psalm 23', 'Psalm 119', 'Genesis 1', 'Matthew 5'], 1, 'Psalm 119 is a long song celebrating God''s law, organized by the letters of the Hebrew alphabet.'),
  (p, 5, 'What is the shortest chapter in the Bible?', array['Psalm 150', 'Psalm 1', '3 John 1', 'Psalm 117'], 3, 'Psalm 117'),
  (p, 5, 'Which Old Testament book is largely written in the form of a wisdom debate between a suffering man and his friends?', array['Lamentations', 'Job', 'Proverbs', 'Ecclesiastes'], 1, 'Job 3:1'),
  (p, 1, 'What did God tell Adam and Eve not to eat?', array['Meat', 'Bread', 'Fruit from the tree of knowledge of good and evil', 'Any fruit at all'], 2, 'Genesis 2:16-17'),
  (p, 1, 'Who is often called "the Rock" on which Jesus said He would build His church?', array['Peter', 'John', 'James', 'Andrew'], 0, 'Matthew 16:18'),
  (p, 2, 'Which day of the week did the early church often meet on to remember Jesus'' resurrection?', array['Saturday (the Sabbath)', 'Wednesday', 'Sunday (the Lord''s Day)', 'Friday'], 2, 'Acts 20:7'),
  (p, 2, 'What is the name of the garden where Jesus prayed the night before He was arrested?', array['Gethsemane', 'Eden', 'Golgotha', 'Gilead'], 0, 'Matthew 26:36'),
  (p, 2, 'What was the name of the hill where Jesus was crucified?', array['Mount Carmel', 'Gethsemane', 'Mount Sinai', 'Golgotha (Calvary)'], 3, 'Matthew 27:33'),
  (p, 3, 'What does the name "Immanuel", used for Jesus, mean?', array['"Light of the world"', '"God with us"', '"Son of David"', '"Prince of Peace"'], 1, 'Matthew 1:23'),
  (p, 3, 'What is the Hebrew word for "so be it" or "truly", said at the end of prayers?', array['Selah', 'Hosanna', 'Amen', 'Hallelujah'], 2, 'Nehemiah 8:6'),
  (p, 2, 'What does "Hallelujah" mean?', array['"Save us now"', '"Praise the Lord"', '"God is good"', '"Thanks be to God"'], 1, 'Psalm 150:6');
  insert into public.question_packs (name, faith) values ('Old Testament', true) returning id into p;
  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (p, 2, 'Who led the Israelites out of Egypt?', array['Aaron', 'Samuel', 'Joshua', 'Moses'], 3, 'Moses parted the Red Sea with God''s help! (Exodus 14)'),
  (p, 2, 'Who defeated the giant Goliath?', array['Samson', 'David', 'Saul', 'Gideon'], 1, 'David used only a sling and a stone. (1 Samuel 17)'),
  (p, 2, 'What did God give Moses on Mount Sinai?', array['A sword', 'A crown', 'A map', 'The Ten Commandments'], 3, 'Exodus 20'),
  (p, 2, 'Who had a coat of many colors?', array['Judah', 'Reuben', 'Benjamin', 'Joseph'], 3, 'Genesis 37:3'),
  (p, 3, 'How many days and nights did it rain during the flood?', array['7', '40', '100', '3'], 1, 'Genesis 7:12'),
  (p, 3, 'What was the name of Abraham''s son of promise?', array['Jacob', 'Isaac', 'Esau', 'Ishmael'], 1, 'Genesis 21:1-3'),
  (p, 3, 'Who was thrown into a lions'' den?', array['Elijah', 'Daniel', 'Shadrach', 'Jeremiah'], 1, 'Daniel 6'),
  (p, 3, 'Who was the strongest man in the Bible, known for his hair?', array['Samson', 'Saul', 'Boaz', 'Goliath'], 0, 'Judges 16'),
  (p, 4, 'What was the name of the walls that fell after the Israelites marched around them?', array['Nineveh', 'Jericho', 'Babylon', 'Ai'], 1, 'Joshua 6'),
  (p, 4, 'Who was sold into slavery by his own brothers?', array['Benjamin', 'Joseph', 'Simeon', 'Levi'], 1, 'Genesis 37:26-28'),
  (p, 4, 'Who interpreted Pharaoh''s dreams about 7 fat cows and 7 skinny cows?', array['Joseph', 'Moses', 'Aaron', 'Daniel'], 0, 'Genesis 41:1-32'),
  (p, 5, 'What was the name of the garden where Adam and Eve first lived?', array['Canaan', 'Goshen', 'Eden', 'Gethsemane'], 2, 'Genesis 2:8'),
  (p, 5, 'How many years did the Israelites wander in the wilderness?', array['70', '40', '25', '12'], 1, 'Numbers 14:33-34'),
  (p, 5, 'Which judge of Israel defeated the Midianites with just 300 men?', array['Samson', 'Gideon', 'Ehud', 'Deborah'], 1, 'Judges 7'),
  (p, 1, 'Who was Adam and Eve''s first son?', array['Abel', 'Seth', 'Cain', 'Enoch'], 2, 'Genesis 4:1'),
  (p, 1, 'Who killed his brother Abel?', array['Lamech', 'Noah', 'Seth', 'Cain'], 3, 'Genesis 4:8'),
  (p, 1, 'How many animals of each clean kind did God tell Noah to bring on the ark (at least)?', array['Six', 'Two', 'Four', 'One'], 1, 'Genesis 7:2-3'),
  (p, 1, 'What sign did God put in the sky after the flood as a promise never to flood the whole earth again?', array['A star', 'A cloud', 'A rainbow', 'A dove'], 2, 'Genesis 9:13'),
  (p, 1, 'What did the people try to build to reach up to heaven?', array['The temple', 'The walls of Jericho', 'The ark of the covenant', 'The Tower of Babel'], 3, 'Genesis 11:4'),
  (p, 1, 'Who is called "the father of many nations" because of his great faith?', array['Isaac', 'Noah', 'Jacob', 'Abraham'], 3, 'Genesis 17:5'),
  (p, 1, 'What was Abraham''s wife''s name?', array['Rebekah', 'Sarah', 'Rachel', 'Leah'], 1, 'Genesis 17:15'),
  (p, 1, 'Who was Isaac''s wife?', array['Rachel', 'Leah', 'Sarah', 'Rebekah'], 3, 'Genesis 24:67'),
  (p, 1, 'Jacob''s name was changed to what after wrestling with an angel?', array['Israel', 'Judah', 'Benjamin', 'Levi'], 0, 'Genesis 32:28'),
  (p, 1, 'How many sons did Jacob have?', array['7', '12', '10', '9'], 1, 'Genesis 35:22-26'),
  (p, 1, 'Where was baby Moses hidden to keep him safe?', array['In a tent', 'In a basket among the reeds of the river', 'In a barn', 'In a cave'], 1, 'Exodus 2:3'),
  (p, 1, 'What did God turn into a snake when Moses threw it down?', array['A rope', 'A stone', 'His sandal', 'His staff'], 3, 'Exodus 4:2-4'),
  (p, 1, 'How many plagues did God send on Egypt?', array['7', '10', '12', '5'], 1, 'Exodus 7-12'),
  (p, 1, 'What sea did God part for the Israelites to cross?', array['The Mediterranean Sea', 'The Dead Sea', 'The Sea of Galilee', 'The Red Sea'], 3, 'Exodus 14:21-22'),
  (p, 1, 'What food did God send from heaven to feed the Israelites in the desert?', array['Honey', 'Fish', 'Bread', 'Manna'], 3, 'Exodus 16:14-15'),
  (p, 1, 'On what mountain did Moses receive the Ten Commandments?', array['Mount Sinai', 'Mount Zion', 'Mount Ararat', 'Mount Carmel'], 0, 'Exodus 19-20'),
  (p, 1, 'Who led the Israelites into the Promised Land after Moses died?', array['Joshua', 'Caleb', 'Aaron', 'Samuel'], 0, 'Joshua 1:1-2'),
  (p, 1, 'What happened to the walls of Jericho after the Israelites marched around them and shouted?', array['They fell down', 'They turned to gold', 'They opened by themselves', 'Nothing happened'], 0, 'Joshua 6:20'),
  (p, 1, 'What was Samson''s secret source of great strength?', array['His sword', 'His shield', 'His long hair', 'His sandals'], 2, 'Judges 16:17'),
  (p, 1, 'Who cut Samson''s hair while he slept?', array['Jezebel', 'Michal', 'Delilah', 'Deborah'], 2, 'Judges 16:19'),
  (p, 1, 'Who was the first king of Israel?', array['David', 'Solomon', 'Saul', 'Samuel'], 2, '1 Samuel 10:1'),
  (p, 1, 'As a young shepherd, what did David use to fight lions and bears?', array['A bow', 'A net', 'His hands and a club', 'A sword'], 2, '1 Samuel 17:34-36'),
  (p, 1, 'What instrument did David play to soothe King Saul?', array['The drum', 'The flute', 'The trumpet', 'The harp'], 3, '1 Samuel 16:23'),
  (p, 1, 'Who was David''s best friend, the son of King Saul?', array['Solomon', 'Abner', 'Jonathan', 'Absalom'], 2, '1 Samuel 18:1-3'),
  (p, 1, 'Which of David''s sons became famous for his wisdom as king?', array['Solomon', 'Adonijah', 'Absalom', 'Rehoboam'], 0, '1 Kings 3:12'),
  (p, 1, 'What did God offer to give Solomon anything he asked for, and what did Solomon choose?', array['Wisdom', 'Power over enemies', 'Long life', 'Riches'], 0, '1 Kings 3:5-12'),
  (p, 1, 'What great building did Solomon build for God in Jerusalem?', array['The Palace', 'The Ark', 'The Tabernacle', 'The Temple'], 3, '1 Kings 6:1'),
  (p, 1, 'Which prophet was fed by ravens beside a brook?', array['Isaiah', 'Ezekiel', 'Elisha', 'Elijah'], 3, '1 Kings 17:4-6'),
  (p, 1, 'On which mountain did Elijah challenge the prophets of Baal to a contest?', array['Mount Nebo', 'Mount Ararat', 'Mount Sinai', 'Mount Carmel'], 3, '1 Kings 18:19-40'),
  (p, 1, 'How did Elijah leave the earth?', array['He was swallowed by the earth', 'He was taken up to heaven in a whirlwind by a chariot of fire', 'He grew old and died peacefully', 'He walked into the sea'], 1, '2 Kings 2:11'),
  (p, 2, 'Which prophet asked for a "double portion" of Elijah''s spirit before Elijah left?', array['Isaiah', 'Jeremiah', 'Elisha', 'Amos'], 2, '2 Kings 2:9'),
  (p, 2, 'Who was the wicked queen who wanted to kill Elijah and worshipped the false god Baal?', array['Athaliah', 'Bathsheba', 'Delilah', 'Jezebel'], 3, '1 Kings 16:31; 19:1-2'),
  (p, 2, 'Which young Israelite woman became queen of Persia and saved her people from destruction?', array['Esther', 'Deborah', 'Rahab', 'Ruth'], 0, 'Esther 2:17'),
  (p, 2, 'Who was the wicked official in the book of Esther who plotted to destroy the Jewish people?', array['Nebuchadnezzar', 'Xerxes (Ahasuerus)', 'Haman', 'Mordecai'], 2, 'Esther 3:1-6'),
  (p, 2, 'Who was Naomi''s loyal daughter-in-law who said "Where you go, I will go"?', array['Rebekah', 'Orpah', 'Rachel', 'Ruth'], 3, 'Ruth 1:16'),
  (p, 2, 'Who did Ruth marry in Bethlehem, becoming an ancestor of King David?', array['Mahlon', 'Obed', 'Elimelech', 'Boaz'], 3, 'Ruth 4:13'),
  (p, 2, 'Which judge of Israel was also a prophetess who led the army to victory with Barak?', array['Deborah', 'Ruth', 'Miriam', 'Esther'], 0, 'Judges 4:4-5'),
  (p, 2, 'Whose mother, Hannah, prayed for years for a son and dedicated him to serve God at the temple?', array['Samuel', 'Samson', 'David', 'Saul'], 0, '1 Samuel 1:20'),
  (p, 2, 'As a boy serving in the temple, who heard God calling his name in the night?', array['Samuel', 'Josiah', 'Jeremiah', 'David'], 0, '1 Samuel 3:1-10'),
  (p, 2, 'Who was thrown into a den of lions for praying to God instead of the king?', array['Jeremiah', 'Shadrach', 'Daniel', 'Ezekiel'], 2, 'Daniel 6:16'),
  (p, 2, 'What king had a dream about a giant statue that Daniel interpreted?', array['Darius', 'Belshazzar', 'Cyrus', 'Nebuchadnezzar'], 3, 'Daniel 2:31-45'),
  (p, 2, 'What mysterious message appeared written on the wall during Belshazzar''s feast?', array['"The Lord is my shepherd"', '"Fear not"', '"Peace be with you"', '"Mene, Mene, Tekel, Upharsin"'], 3, 'Daniel 5:25'),
  (p, 2, 'Which prophet ran away from God''s call and was swallowed by a great fish?', array['Joel', 'Amos', 'Hosea', 'Jonah'], 3, 'Jonah 1:17'),
  (p, 2, 'What city did God send Jonah to warn?', array['Tarshish', 'Babylon', 'Samaria', 'Nineveh'], 3, 'Jonah 1:2'),
  (p, 2, 'Which prophet saw a vision of a valley full of dry bones coming back to life?', array['Ezekiel', 'Isaiah', 'Daniel', 'Jeremiah'], 0, 'Ezekiel 37:1-14'),
  (p, 2, 'Which prophet is known as "the weeping prophet" for grieving over Jerusalem''s fall?', array['Jeremiah', 'Ezekiel', 'Amos', 'Isaiah'], 0, 'Jeremiah 9:1'),
  (p, 2, 'Who wrote most of the book of Proverbs?', array['Solomon', 'Asaph', 'David', 'Moses'], 0, 'Proverbs 1:1'),
  (p, 3, 'What was the name of Joseph''s father?', array['Isaac', 'Esau', 'Jacob', 'Abraham'], 2, 'Genesis 37:1-2'),
  (p, 3, 'What position did Joseph rise to in Egypt after interpreting Pharaoh''s dreams?', array['Royal messenger', 'High priest', 'Chief soldier', 'Second-in-command over all Egypt'], 3, 'Genesis 41:39-41'),
  (p, 3, 'What did Joseph''s brothers do with his coat to trick their father?', array['Buried it', 'Dipped it in animal blood', 'Burned it', 'Sold it'], 1, 'Genesis 37:31-33'),
  (p, 3, 'Who wrestled with a mysterious man all night at a place he named Peniel?', array['Isaac', 'Moses', 'Jacob', 'Abraham'], 2, 'Genesis 32:24-30'),
  (p, 3, 'What did Esau sell to his brother Jacob for a bowl of stew?', array['His flocks', 'His tent', 'His birthright', 'His name'], 2, 'Genesis 25:29-34'),
  (p, 3, 'What was the name of the mountain where Abraham was ready to offer his son Isaac?', array['Mount Nebo', 'Mount Moriah', 'Mount Sinai', 'Mount Horeb'], 1, 'Genesis 22:2'),
  (p, 3, 'Which of Jacob''s wives was loved more, Leah or Rachel?', array['Leah', 'They were loved equally', 'Rachel', 'Neither'], 2, 'Genesis 29:30'),
  (p, 3, 'Who was the sister of Moses who watched over baby Moses in the river and later became a leader?', array['Rahab', 'Deborah', 'Zipporah', 'Miriam'], 3, 'Exodus 2:4-8; 15:20'),
  (p, 3, 'What was Moses'' brother''s name, who helped him speak to Pharaoh and became the first high priest?', array['Nadab', 'Caleb', 'Joshua', 'Aaron'], 3, 'Exodus 4:14'),
  (p, 3, 'What special box held the Ten Commandments and other holy items?', array['The Altar', 'The Mercy Seat', 'The Tabernacle', 'The Ark of the Covenant'], 3, 'Exodus 25:10-16'),
  (p, 3, 'Along with Joshua, which other spy trusted God and gave a good report about the Promised Land?', array['Othniel', 'Caleb', 'Achan', 'Nun'], 1, 'Numbers 14:6-9'),
  (p, 3, 'Which harlot in Jericho hid the Israelite spies and was saved when the city fell?', array['Rahab', 'Ruth', 'Tamar', 'Delilah'], 0, 'Joshua 2:1-6'),
  (p, 3, 'Who was king Saul''s general who was later killed by Joab?', array['Amasa', 'Jonathan', 'Abner', 'Ish-bosheth'], 2, '2 Samuel 3:27'),
  (p, 3, 'Who was the prophet who confronted King David after his sin with Bathsheba, telling a parable about a lamb?', array['Nathan', 'Ahijah', 'Gad', 'Samuel'], 0, '2 Samuel 12:1-7'),
  (p, 3, 'David''s son led a rebellion against him and was killed while caught by his hair in a tree - who was he?', array['Adonijah', 'Amnon', 'Solomon', 'Absalom'], 3, '2 Samuel 18:9-15'),
  (p, 3, 'After Solomon died, the kingdom split into two - what were they called?', array['Israel and Egypt', 'Ephraim and Manasseh', 'Israel (north) and Judah (south)', 'Judah and Samaria'], 2, '1 Kings 12:16-20'),
  (p, 3, 'Which foreign empire eventually destroyed Jerusalem and took its people into exile?', array['Egypt', 'Assyria', 'Babylon', 'Persia'], 2, '2 Kings 25:1-10'),
  (p, 3, 'Which Persian king allowed the Jewish exiles to return home and rebuild the temple?', array['Xerxes', 'Darius', 'Cyrus', 'Artaxerxes'], 2, 'Ezra 1:1-4'),
  (p, 3, 'Who led the effort to rebuild the walls of Jerusalem after the exile?', array['Zerubbabel', 'Haggai', 'Nehemiah', 'Ezra'], 2, 'Nehemiah 2:17-18'),
  (p, 3, 'Who was the priest and scribe who read the Law of Moses aloud to the returned exiles?', array['Nehemiah', 'Ezra', 'Malachi', 'Zechariah'], 1, 'Nehemiah 8:1-8'),
  (p, 4, 'What was the name of the place where God first spoke to Moses out of a burning bush?', array['Midian', 'Sinai only', 'Horeb (Mount Sinai)', 'Kadesh'], 2, 'Exodus 3:1-2'),
  (p, 4, 'What was Moses'' father-in-law''s name, a priest of Midian?', array['Hobab', 'Reuel', 'Amram', 'Jethro'], 3, 'He is called both Jethro and Reuel in different passages. (Exodus 3:1; 18:1)'),
  (p, 4, 'Which two of the twelve spies were allowed to enter the Promised Land because of their faith?', array['Joshua and Aaron', 'Joshua and Caleb', 'Caleb and Othniel', 'Nun and Jephunneh'], 1, 'Numbers 14:30'),
  (p, 4, 'What was the name of the pagan god that the people worshipped when they made a golden idol at Mount Sinai?', array['Baal', 'Dagon', 'Molech', 'A golden calf'], 3, 'Exodus 32:1-4'),
  (p, 4, 'Which judge made a rash vow that cost him his own daughter?', array['Othniel', 'Jephthah', 'Gideon', 'Ehud'], 1, 'Judges 11:30-39'),
  (p, 4, 'What sign did Gideon ask God for, involving wool and dew?', array['The fleece', 'A pillar of fire', 'A burning bush', 'A rainbow'], 0, 'Judges 6:36-40'),
  (p, 4, 'How many men did God tell Gideon to keep for battle against the Midianites, out of an original 32,000?', array['30', '3,000', '300', '3'], 2, 'Judges 7:2-7'),
  (p, 4, 'Who was the left-handed judge who assassinated the oppressive King Eglon of Moab?', array['Tola', 'Shamgar', 'Jair', 'Ehud'], 3, 'Judges 3:15-22'),
  (p, 4, 'What was unusual about how Samson''s birth was announced?', array['He was born to a very old woman', 'An angel told his parents he would be a Nazirite from birth', 'His birth was foretold by a dream', 'He was born in a foreign land'], 1, 'Judges 13:2-5'),
  (p, 4, 'What weapon did Samson use to kill a thousand Philistines?', array['His bare hands only', 'The jawbone of a donkey', 'A sling', 'A sword'], 1, 'Judges 15:15-16'),
  (p, 4, 'What was Job''s response after losing his family, health and wealth in one blow after another?', array['He gave up his faith', 'He cursed God immediately', 'He still did not sin or blame God', 'He ran away'], 2, 'Job 1:20-22'),
  (p, 4, 'How many friends came to comfort (and later argue with) Job?', array['Seven', 'Five', 'Two', 'Three, then a fourth younger man'], 3, 'Job 2:11'),
  (p, 4, 'What was restored to Job at the end of his story?', array['Exactly what he lost', 'Double what he had before', 'Half of what he lost', 'Nothing, he remained poor'], 1, 'Job 42:10'),
  (p, 4, 'Which king of Israel first anointed by Samuel later disobeyed God by not destroying the Amalekites completely?', array['Saul', 'Jeroboam', 'Solomon', 'David'], 0, '1 Samuel 15:1-23'),
  (p, 4, 'What did David do to try to hide his sin after taking Bathsheba, Uriah''s wife?', array['He arranged for Uriah to die in battle', 'He made Uriah a general', 'He confessed immediately', 'He sent Uriah away to another country'], 0, '2 Samuel 11:14-17'),
  (p, 4, 'Which of Solomon''s many wrongdoings led to the kingdom being torn apart after his death?', array['He built too many buildings', 'He refused to build the temple', 'He gave away too much treasure', 'He let his foreign wives turn his heart to other gods'], 3, '1 Kings 11:1-4'),
  (p, 4, 'Who was Solomon''s son whose harsh answer to the people caused the kingdom to split?', array['Asa', 'Abijah', 'Rehoboam', 'Jeroboam'], 2, '1 Kings 12:12-16'),
  (p, 4, 'Which northern-kingdom king first led Israel into idol worship by setting up golden calves?', array['Ahab', 'Omri', 'Jehu', 'Jeroboam'], 3, '1 Kings 12:28-29'),
  (p, 4, 'Which righteous king of Judah tore his robe and led a great revival after finding the Book of the Law?', array['Jehoshaphat', 'Asa', 'Hezekiah', 'Josiah'], 3, '2 Kings 22:8-13; 23:1-3'),
  (p, 4, 'Which king of Judah''s prayer for healing added fifteen years to his life, with the sun''s shadow moving backward as a sign?', array['Josiah', 'Hezekiah', 'Manasseh', 'Uzziah'], 1, '2 Kings 20:8-11'),
  (p, 4, 'What miraculous event does the book of Isaiah prophesy about a virgin?', array['She would become queen', 'She would lead an army', 'She would bear a son called Immanuel', 'She would build the temple'], 2, 'Isaiah 7:14'),
  (p, 4, 'Which prophet bought a field as a sign of hope even while Jerusalem was under siege?', array['Jeremiah', 'Habakkuk', 'Ezekiel', 'Isaiah'], 0, 'Jeremiah 32:6-15'),
  (p, 5, 'What was the name of Adam and Eve''s third son, born after Cain killed Abel?', array['Enosh', 'Cainan', 'Seth', 'Enoch'], 2, 'Genesis 4:25'),
  (p, 5, 'Who was taken up to heaven without dying, said to have "walked with God"?', array['Noah', 'Moses', 'Elijah', 'Enoch'], 3, 'Genesis 5:24'),
  (p, 5, 'How old was Methuselah, the oldest person recorded in the Bible, when he died?', array['1,000 years', '969 years', '900 years', '777 years'], 1, 'Genesis 5:27'),
  (p, 5, 'What was the name of Noah''s three sons?', array['Shem, Ham and Japheth', 'Ham, Levi and Judah', 'Shem, Cain and Seth', 'Japheth, Reuben and Simeon'], 0, 'Genesis 6:10'),
  (p, 5, 'What was the name of the region and city where the Tower of Babel was built?', array['Nineveh', 'Babel, in the land of Shinar', 'Haran', 'Ur, in Chaldea'], 1, 'Genesis 11:2-9'),
  (p, 5, 'What city was Abraham originally from before God called him to leave?', array['Ur of the Chaldeans', 'Nineveh', 'Haran', 'Damascus'], 0, 'Genesis 11:31'),
  (p, 5, 'What was the name of the mysterious king and priest of Salem who blessed Abraham with bread and wine?', array['Abimelech', 'Lot', 'Melchizedek', 'Eliezer'], 2, 'Genesis 14:18-20'),
  (p, 5, 'Who was Abraham''s nephew, rescued from Sodom before it was destroyed?', array['Eliezer', 'Ishmael', 'Lot', 'Laban'], 2, 'Genesis 19:15-16'),
  (p, 5, 'What happened to Lot''s wife when she looked back at the burning city?', array['She was struck blind', 'She turned into a pillar of salt', 'She disappeared', 'She turned to stone'], 1, 'Genesis 19:26'),
  (p, 5, 'Who was Jacob''s uncle and father-in-law who tricked him into marrying the wrong sister first?', array['Nahor', 'Terah', 'Bethuel', 'Laban'], 3, 'Genesis 29:21-25'),
  (p, 5, 'What was Joseph''s Egyptian name given to him by Pharaoh?', array['Manasseh', 'Zaphenath-Paneah', 'Zebulun', 'Potiphar'], 1, 'Genesis 41:45'),
  (p, 5, 'Who was the Egyptian official whose wife falsely accused Joseph, leading to his imprisonment?', array['Ahasuerus', 'Pharaoh', 'Potiphar', 'Zaphenath-Paneah'], 2, 'Genesis 39:7-20'),
  (p, 5, 'What were the names of Joseph''s two sons, born in Egypt?', array['Perez and Zerah', 'Reuben and Simeon', 'Manasseh and Ephraim', 'Levi and Judah'], 2, 'Genesis 41:50-52'),
  (p, 5, 'What was the name of the plague that finally convinced Pharaoh to let Israel go?', array['The plague of hail', 'The plague of frogs', 'The death of the firstborn', 'The plague of locusts'], 2, 'Exodus 12:29-30'),
  (p, 5, 'What is the meal called that Israelites ate the night before leaving Egypt, remembered every year since?', array['The Feast of Trumpets', 'The Feast of Tabernacles', 'The Feast of Weeks', 'The Passover'], 3, 'Exodus 12:1-14'),
  (p, 5, 'What was the bronze object Moses made that healed anyone bitten by snakes who looked at it?', array['The bronze serpent', 'The bronze laver', 'The Ark of the Covenant', 'The bronze altar'], 0, 'Numbers 21:8-9'),
  (p, 5, 'Who succeeded Aaron as high priest?', array['Phinehas', 'Eleazar', 'Nadab', 'Ithamar'], 1, 'Numbers 20:25-28'),
  (p, 5, 'What was the name of the seer hired by Balak to curse Israel, whose donkey saw an angel first?', array['Balaam', 'Balak', 'Eglon', 'Zippor'], 0, 'Numbers 22:21-31'),
  (p, 5, 'Which minor prophet compared God''s love for unfaithful Israel to his own marriage to an unfaithful wife?', array['Obadiah', 'Joel', 'Hosea', 'Habakkuk'], 2, 'Hosea 1:2-3'),
  (p, 5, 'Which minor prophet''s short book is entirely about judgment on the nation of Edom?', array['Habakkuk', 'Nahum', 'Obadiah', 'Zephaniah'], 2, 'Obadiah 1:1'),
  (p, 5, 'Which prophet questioned God about why He would use the wicked Babylonians to punish Judah?', array['Habakkuk', 'Nahum', 'Zephaniah', 'Joel'], 0, 'Habakkuk 1:12-13'),
  (p, 5, 'What was the name of the pool of locusts and devastation described in the book of Joel, used as a picture of judgment?', array['The Day of the Lord', 'The Valley of Dry Bones', 'The Plain of Sharon', 'The Valley of Decision (Jehoshaphat)'], 0, 'Joel 3:14');
  insert into public.question_packs (name, faith) values ('New Testament', true) returning id into p;
  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (p, 2, 'How many days was Jesus in the tomb before rising again?', array['3', '7', '40', '1'], 0, 'Matthew 28:1-6'),
  (p, 2, 'What was Jesus'' first miracle?', array['Walking on water', 'Healing a blind man', 'Turning water into wine', 'Feeding 5000'], 2, 'John 2:1-11'),
  (p, 2, 'Who betrayed Jesus for 30 pieces of silver?', array['John', 'Judas', 'Peter', 'Thomas'], 1, 'Matthew 26:14-16'),
  (p, 3, 'On what mountain did Jesus give a famous sermon?', array['Mount Carmel', 'Mount Sinai', 'Mount Ararat', 'The Mount of Olives'], 3, 'Actually it''s often just called "the mount" in the Sermon on the Mount (Matthew 5-7). (Matthew 5:1)'),
  (p, 3, 'How many loaves and fish fed the 5000?', array['3 loaves, 7 fish', '2 loaves, 5 fish', '7 loaves, 3 fish', '5 loaves, 2 fish'], 3, 'John 6:1-13'),
  (p, 4, 'Which disciple walked on water toward Jesus before he began to sink?', array['James', 'John', 'Andrew', 'Peter'], 3, 'Matthew 14:28-31'),
  (p, 4, 'On the road to where did Saul (later Paul) encounter Jesus in a bright light?', array['Jerusalem', 'Antioch', 'Damascus', 'Bethlehem'], 2, 'Acts 9:1-9'),
  (p, 5, 'On which island was the apostle John when he received the Book of Revelation?', array['Crete', 'Cyprus', 'Patmos', 'Malta'], 2, 'Revelation 1:9'),
  (p, 5, 'What was the name of the high priest''s servant whose ear Peter cut off?', array['Barabbas', 'Annas', 'Caiaphas', 'Malchus'], 3, 'John 18:10'),
  (p, 1, 'Who was the angel who told Mary she would give birth to Jesus?', array['Raphael', 'Uriel', 'Michael', 'Gabriel'], 3, 'Luke 1:26-31'),
  (p, 1, 'Where did Mary and Joseph have to travel to for a census, where Jesus was born?', array['Nazareth', 'Bethlehem', 'Jerusalem', 'Egypt'], 1, 'Luke 2:1-7'),
  (p, 1, 'What did the wise men (Magi) follow to find baby Jesus?', array['A dream', 'A star', 'An angel', 'A dove'], 1, 'Matthew 2:1-2'),
  (p, 1, 'What gifts did the wise men bring to Jesus?', array['Gold, silver and bronze', 'Gold, frankincense and myrrh', 'Silver, spices and cloth', 'Bread, wine and oil'], 1, 'Matthew 2:11'),
  (p, 1, 'Who baptized Jesus in the Jordan River?', array['Andrew', 'Philip', 'Peter', 'John the Baptist'], 3, 'Matthew 3:13-17'),
  (p, 1, 'What appeared over Jesus and a voice spoke from heaven at His baptism?', array['Fire from heaven', 'A bright star', 'The Holy Spirit like a dove', 'A rainbow'], 2, 'Matthew 3:16-17'),
  (p, 1, 'How many days did Jesus fast in the wilderness before being tempted by Satan?', array['7', '12', '3', '40'], 3, 'Matthew 4:1-2'),
  (p, 1, 'What were the jobs of Peter and Andrew before Jesus called them?', array['Shepherds', 'Tax collectors', 'Carpenters', 'Fishermen'], 3, 'Matthew 4:18'),
  (p, 1, 'What did Jesus say He would make Peter and Andrew become?', array['"Fishers of men"', 'Teachers of the Law', 'Kings of Israel', 'High priests'], 0, 'Matthew 4:19'),
  (p, 1, 'Who was Jesus'' cousin who prepared the way for Him, wearing camel''s hair and eating locusts and honey?', array['John the Baptist', 'Lazarus', 'James', 'Andrew'], 0, 'Luke 1:36; Matthew 3:4'),
  (p, 1, 'What was Jesus'' earthly father Joseph''s trade?', array['Fisherman', 'Carpenter', 'Shepherd', 'Farmer'], 1, 'Matthew 13:55'),
  (p, 1, 'What town did Jesus grow up in?', array['Capernaum', 'Jerusalem', 'Nazareth', 'Bethlehem'], 2, 'Luke 2:39-40'),
  (p, 1, 'Which disciple doubted that Jesus had risen until he touched His wounds?', array['Thomas', 'James', 'Peter', 'Philip'], 0, 'John 20:24-29'),
  (p, 1, 'What did Jesus do at the wedding in Cana as His first miracle?', array['Multiplied bread', 'Calmed a storm', 'Turned water into wine', 'Healed the bridegroom'], 2, 'John 2:1-11'),
  (p, 1, 'Who did Jesus raise from the dead after he had been in the tomb four days?', array['Stephen', 'The widow''s son', 'Lazarus', 'Jairus'' daughter'], 2, 'John 11:38-44'),
  (p, 1, 'What did Jesus walk on to reach His disciples'' boat during a storm?', array['Sand', 'Ice', 'Water', 'A bridge'], 2, 'Matthew 14:25'),
  (p, 1, 'What did Jesus do to the storm when His disciples were afraid on the boat?', array['He asked Peter to fix it', 'He made the boat fly', 'He sent an angel', 'He calmed it, saying "Peace, be still"'], 3, 'Mark 4:37-39'),
  (p, 1, 'What animal did Jesus ride into Jerusalem on Palm Sunday?', array['A horse', 'A camel', 'A donkey', 'A mule alone'], 2, 'Matthew 21:1-7'),
  (p, 1, 'What did the crowds wave and lay on the ground as Jesus entered Jerusalem?', array['Flowers', 'Gold coins', 'Torches', 'Palm branches and cloaks'], 3, 'John 12:12-13'),
  (p, 1, 'What did Jesus and His disciples share at the Last Supper that we still remember today?', array['Fish and bread', 'Honey and milk', 'Lamb and herbs only', 'Bread and wine (Communion)'], 3, 'Luke 22:19-20'),
  (p, 1, 'Who denied knowing Jesus three times before the rooster crowed?', array['Judas', 'John', 'Thomas', 'Peter'], 3, 'Matthew 26:69-75'),
  (p, 1, 'What did the Roman soldiers put on Jesus'' head to mock Him as king?', array['A gold crown', 'A wreath of leaves', 'A helmet', 'A crown of thorns'], 3, 'Matthew 27:29'),
  (p, 1, 'What sign did Pilate write and place above Jesus on the cross?', array['"Rabbi and Teacher"', '"Son of David"', '"The Messiah"', '"Jesus of Nazareth, King of the Jews"'], 3, 'John 19:19'),
  (p, 1, 'Who rolled away the stone from Jesus'' tomb?', array['Peter', 'Mary Magdalene', 'An angel', 'A soldier'], 2, 'Matthew 28:2'),
  (p, 1, 'Who was the first person to see Jesus after He rose from the dead?', array['John', 'Mary Magdalene', 'Thomas', 'Peter'], 1, 'John 20:11-16'),
  (p, 1, 'Where did Jesus go after appearing to His disciples for 40 days after His resurrection?', array['He went to Rome', 'He ascended into heaven', 'He stayed hidden in Jerusalem', 'He returned to Nazareth'], 1, 'Acts 1:3-9'),
  (p, 1, 'What did the Holy Spirit look like when it came upon the disciples at Pentecost?', array['Tongues of fire', 'A bright cloud', 'A dove', 'A rainbow'], 0, 'Acts 2:3'),
  (p, 1, 'Who was struck blind on the road to Damascus and later became a great missionary?', array['Silas', 'Barnabas', 'Saul (Paul)', 'Stephen'], 2, 'Acts 9:1-9'),
  (p, 1, 'Who was the first Christian martyr, stoned to death for his faith?', array['James', 'Peter', 'Paul', 'Stephen'], 3, 'Acts 7:54-60'),
  (p, 1, 'Who cut off the ear of the high priest''s servant when Jesus was arrested?', array['James', 'John', 'Peter', 'Andrew'], 2, 'John 18:10'),
  (p, 2, 'What group of religious leaders often argued with Jesus about the Law and traditions?', array['Levites', 'Pharisees', 'Samaritans', 'Centurions'], 1, 'Matthew 23:1-7'),
  (p, 2, 'Which tax collector climbed a tree to see Jesus because he was too short to see over the crowd?', array['Matthew', 'Levi', 'Zacchaeus', 'Bartimaeus'], 2, 'Luke 19:1-4'),
  (p, 2, 'What did Jesus tell Zacchaeus after visiting his house?', array['"Follow me"', '"Go and sin no more"', '"Today salvation has come to this house"', '"Your faith has healed you"'], 2, 'Luke 19:9'),
  (p, 2, 'Which blind beggar called out to Jesus, "Son of David, have mercy on me!"?', array['Simeon', 'Zacchaeus', 'Lazarus', 'Bartimaeus'], 3, 'Mark 10:46-47'),
  (p, 2, 'Which two sisters, friends of Jesus, lived in Bethany with their brother Lazarus?', array['Mary and Martha', 'Martha and Joanna', 'Mary and Elizabeth', 'Mary and Salome'], 0, 'Luke 10:38-39'),
  (p, 2, 'Who was criticized by her sister for sitting at Jesus'' feet listening instead of helping serve?', array['Mary', 'Martha', 'Joanna', 'Susanna'], 0, 'Luke 10:40-42'),
  (p, 2, 'Who was the Roman governor who sentenced Jesus to be crucified?', array['Caiaphas', 'Pontius Pilate', 'Felix', 'Herod'], 1, 'Matthew 27:2'),
  (p, 2, 'Which king questioned Jesus and mocked Him before sending Him back to Pilate?', array['Herod Agrippa', 'Herod the Great', 'Herod Antipas', 'Archelaus'], 2, 'Luke 23:6-11'),
  (p, 2, 'Which criminal was released instead of Jesus at the crowd''s demand?', array['Barabbas', 'Dismas', 'Malchus', 'Gestas'], 0, 'Matthew 27:15-21'),
  (p, 2, 'Who helped carry Jesus'' cross to Golgotha?', array['Simon Peter', 'Joseph of Arimathea', 'Nicodemus', 'Simon of Cyrene'], 3, 'Matthew 27:32'),
  (p, 2, 'Who asked Pilate for Jesus'' body and placed it in his own new tomb?', array['Nicodemus', 'Simon of Cyrene', 'Lazarus', 'Joseph of Arimathea'], 3, 'Matthew 27:57-60'),
  (p, 2, 'Which Pharisee visited Jesus at night and was told he must be "born again"?', array['Nicodemus', 'Joseph of Arimathea', 'Gamaliel', 'Simon'], 0, 'John 3:1-7'),
  (p, 2, 'Which of Jesus'' disciples was a tax collector before following Him?', array['Peter', 'James', 'Thaddaeus', 'Matthew (Levi)'], 3, 'Matthew 9:9'),
  (p, 2, 'Which two disciples were brothers nicknamed "Sons of Thunder"?', array['Peter and Andrew', 'Philip and Bartholomew', 'James and Judas', 'James and John'], 3, 'Mark 3:17'),
  (p, 2, 'Which disciple brought a boy with five loaves and two fish to Jesus?', array['Philip', 'Peter', 'John', 'Andrew'], 3, 'John 6:8-9'),
  (p, 2, 'Who was the disciple that betrayed Jesus and later hanged himself in remorse?', array['Simon the Zealot', 'Judas Iscariot', 'Thaddaeus', 'Thomas'], 1, 'Matthew 27:3-5'),
  (p, 2, 'Which apostle was known for his missionary journeys and wrote many New Testament letters?', array['Peter', 'John', 'Paul', 'James'], 2, 'Acts 13:2-3'),
  (p, 2, 'Who was Paul''s traveling companion on his missionary journeys, whose name means "son of encouragement"?', array['Titus', 'Silas', 'Timothy', 'Barnabas'], 3, 'Acts 4:36'),
  (p, 2, 'Which young man did Paul mentor and later write two personal letters to, encouraging him in ministry?', array['Mark', 'Timothy', 'Luke', 'Titus'], 1, '1 Timothy 1:2'),
  (p, 2, 'Who wrote the Gospel of Luke and the book of Acts, and was a doctor?', array['Luke', 'Matthew', 'John', 'Mark'], 0, 'Colossians 4:14'),
  (p, 2, 'What happened to Paul and Silas in prison at Philippi that led to the jailer''s conversion?', array['An earthquake opened the prison doors while they sang hymns', 'An angel freed them silently', 'The jailer released them out of pity', 'They escaped through a window'], 0, 'Acts 16:25-26'),
  (p, 3, 'What is the collection of Jesus'' teachings on true blessedness called, beginning "Blessed are..."?', array['The Lord''s Prayer', 'The Parables', 'The Beatitudes', 'The Great Commission'], 2, 'Matthew 5:3-12'),
  (p, 3, 'What did Jesus call His followers to be, using salt and light as pictures?', array['"Bread of life"', '"Salt of the earth" and "light of the world"', '"Good shepherds"', '"Living water"'], 1, 'Matthew 5:13-14'),
  (p, 3, 'What is Jesus'' final instruction to His disciples called, to go and make disciples of all nations?', array['The Lord''s Prayer', 'The Great Commandment', 'The Sermon on the Mount', 'The Great Commission'], 3, 'Matthew 28:19-20'),
  (p, 3, 'Which three disciples witnessed Jesus'' transfiguration on the mountain?', array['Peter, Andrew and John', 'Peter, John and Matthew', 'James, John and Thomas', 'Peter, James and John'], 3, 'Matthew 17:1'),
  (p, 3, 'Which two Old Testament figures appeared with Jesus at the Transfiguration?', array['Moses and Elijah', 'Moses and Isaiah', 'Abraham and Isaac', 'Elijah and Elisha'], 0, 'Matthew 17:3'),
  (p, 3, 'What did Jesus do when His friend Lazarus died, before raising him?', array['He got angry', 'He left immediately', 'He wept', 'He sang a psalm'], 2, 'This is where the shortest verse, "Jesus wept," comes from (John 11:35).'),
  (p, 3, 'How many loaves and fish fed the crowd of about 4,000 people, in the second feeding miracle?', array['7 loaves, a few small fish', '5 loaves, 2 fish', '12 loaves, 5 fish', '2 loaves, 7 fish'], 0, 'Matthew 15:32-38'),
  (p, 3, 'What did Jesus use to heal a blind man by making mud with His saliva?', array['He put mud made with saliva on the man''s eyes', 'He spoke a word only', 'He gave him water to drink', 'He touched his eyes only'], 0, 'John 9:6-7'),
  (p, 3, 'Which centurion''s servant was healed by Jesus without Jesus even entering the house?', array['A Roman centurion in Capernaum', 'A centurion at the cross', 'Cornelius', 'Julius'], 0, 'Matthew 8:5-13'),
  (p, 3, 'What did the woman who had bled for twelve years do to be healed by Jesus?', array['She touched the edge (hem) of His cloak', 'She called out His name', 'She sent a servant', 'She washed His feet'], 0, 'Mark 5:25-29'),
  (p, 3, 'Whose daughter did Jesus raise from death, saying "Talitha koum" ("Little girl, get up")?', array['The widow of Nain''s son', 'Jairus''s daughter', 'The centurion''s daughter', 'Lazarus''s sister'], 1, 'Mark 5:41-42'),
  (p, 3, 'What did Jesus do for ten men with leprosy who called out to Him, and how many came back to thank Him?', array['He healed all ten and all thanked Him', 'He healed nine of them', 'He healed all ten; only one returned to thank Him', 'He healed one; the rest were sent away'], 2, 'Luke 17:12-17'),
  (p, 3, 'What miracle did Jesus perform for a man lowered through a roof by his friends?', array['He healed the paralyzed man and forgave his sins', 'He fed the man and his friends', 'He raised the man from the dead', 'He cast out a demon from the man'], 0, 'Mark 2:3-5'),
  (p, 3, 'What did Peter do when he saw Jesus walking on the water, before he began to sink?', array['He rowed the boat faster', 'He tried to walk on the water too', 'He woke the other disciples', 'He jumped overboard to swim away'], 1, 'Matthew 14:29-30'),
  (p, 3, 'In the parable of the sower, what happened to seed that fell among thorns?', array['Birds ate it', 'It never sprouted', 'It grew but was choked by the thorns', 'It produced the best crop'], 2, 'Matthew 13:7,22'),
  (p, 3, 'In the parable of the prodigal son, what did the father do when he saw his son returning?', array['He sent a servant to greet him', 'He ran to meet him and embraced him', 'He refused to see him', 'He waited for the son to apologize first'], 1, 'Luke 15:20'),
  (p, 3, 'In the parable of the Good Samaritan, who passed by the injured man without helping, before the Samaritan stopped?', array['Two merchants', 'A tax collector and a soldier', 'A priest and a Levite', 'Two Pharisees'], 2, 'Luke 10:31-33'),
  (p, 3, 'What did the shepherd in Jesus'' parable do after finding his one lost sheep out of a hundred?', array['He left it to find its own way back', 'He punished it', 'He sold it', 'He carried it home rejoicing'], 3, 'Luke 15:4-5'),
  (p, 3, 'In the parable of the talents, what did the servant who buried his one talent receive from the master?', array['A promotion', 'Extra praise for being careful', 'Rebuke, and his talent was taken away', 'Nothing happened to him'], 2, 'Matthew 25:24-30'),
  (p, 3, 'What was foolish about the five virgins in Jesus'' parable of the ten virgins?', array['They were late to the wedding', 'They did not bring extra oil for their lamps', 'They fell asleep', 'They forgot the bridegroom''s name'], 1, 'Matthew 25:1-13'),
  (p, 4, 'What did Jesus say builds a house on rock instead of sand, at the end of the Sermon on the Mount?', array['Giving generously', 'Praying every day', 'Fasting regularly', 'Hearing His words and putting them into practice'], 3, 'Matthew 7:24-27'),
  (p, 4, 'What did Jesus compare the kingdom of heaven to, a very small seed that grows into a large tree?', array['An olive seed', 'A mustard seed', 'A fig seed', 'A grain of wheat'], 1, 'Matthew 13:31-32'),
  (p, 4, 'What did the woman do with the leaven (yeast) in Jesus'' parable of the kingdom?', array['She mixed it into a large amount of flour until it spread through all of it', 'She sold it in the market', 'She baked it alone', 'She threw it away'], 0, 'Matthew 13:33'),
  (p, 4, 'In the parable of the unforgiving servant, how did the servant treat a fellow servant after his own huge debt was forgiven?', array['He had the fellow servant thrown in prison over a small debt', 'He ignored him', 'He gave him money', 'He forgave him too'], 0, 'Matthew 18:23-35'),
  (p, 4, 'What did the Pharisee and the tax collector each do while praying in Jesus'' parable?', array['The tax collector boasted; the Pharisee was humble', 'Both humbly asked for mercy', 'The Pharisee boasted; the tax collector humbly asked for mercy', 'Both boasted about their good deeds'], 2, 'Luke 18:10-14'),
  (p, 4, 'What did the rich man in the parable of the rich fool plan to do with his abundant harvest?', array['Give it all away', 'Share it with his neighbors', 'Sell it at once', 'Tear down his barns and build bigger ones'], 3, 'Luke 12:16-21'),
  (p, 4, 'What was unusual about the workers hired at the end of the day in the parable of the workers in the vineyard?', array['They received the same pay as those hired at dawn', 'They refused to work', 'They were sent home without pay', 'They received less pay'], 0, 'Matthew 20:1-16'),
  (p, 4, 'What did Jesus tell His disciples to do with the wheat and weeds (tares) growing together, in His parable?', array['Replant everything', 'Burn the whole field', 'Let both grow together until the harvest', 'Pull up the weeds right away'], 2, 'Matthew 13:24-30'),
  (p, 4, 'What did Jesus say about the persistent widow who kept asking an unjust judge for justice?', array['Judges are always fair', 'Widows should not bother judges', 'We should always pray and not give up', 'Prayer changes nothing'], 2, 'Luke 18:1-8'),
  (p, 4, 'At the wedding feast parable, what happened to the man who came without wedding clothes?', array['He was sent home to change', 'He was seated at the head table', 'He was thrown out into the darkness', 'He was forgiven and welcomed'], 2, 'Matthew 22:11-13'),
  (p, 4, 'What is the name of the Samaritan woman''s meeting place with Jesus, where He asked her for water?', array['The Jordan River', 'The pool of Bethesda', 'The pool of Siloam', 'Jacob''s well'], 3, 'John 4:5-6'),
  (p, 4, 'What did Jesus tell the woman at the well that He could give her?', array['"Living water"', '"Bread from heaven"', '"Wine of life"', '"Oil of gladness"'], 0, 'John 4:10'),
  (p, 4, 'What pool did Jesus tell a blind man to wash in after putting mud on his eyes?', array['The Sea of Galilee', 'The Pool of Siloam', 'The Pool of Bethesda', 'Jacob''s well'], 1, 'John 9:7'),
  (p, 4, 'How long had the sick man been waiting by the Pool of Bethesda before Jesus healed him?', array['38 years', '7 years', '3 years', '12 years'], 0, 'John 5:5-9'),
  (p, 4, 'Which apostle had a vision of a sheet full of animals, teaching him not to call anyone impure?', array['Peter', 'Philip', 'John', 'Paul'], 0, 'Acts 10:9-16'),
  (p, 4, 'Who was the Roman centurion, the first Gentile convert recorded in Acts, visited by Peter?', array['Julius', 'Festus', 'Felix', 'Cornelius'], 3, 'Acts 10:1-8'),
  (p, 4, 'What happened to Peter in prison in Acts 12, when an angel appeared to him at night?', array['He escaped by digging under the wall', 'He was released by King Herod', 'His chains fell off and the angel led him out past the guards', 'He convinced the guards to free him'], 2, 'Acts 12:6-10'),
  (p, 4, 'Where did believers get called "Christians" for the very first time?', array['Jerusalem', 'Ephesus', 'Rome', 'Antioch'], 3, 'Acts 11:26'),
  (p, 4, 'What natural disaster freed Paul and Silas from prison at Philippi?', array['A fire', 'A storm', 'An earthquake', 'A flood'], 2, 'Acts 16:25-26'),
  (p, 4, 'On what island was Paul shipwrecked on his way to Rome, where he was bitten by a snake but unharmed?', array['Malta', 'Crete', 'Patmos', 'Cyprus'], 0, 'Acts 28:1'),
  (p, 5, 'What were the names of Zacharias and Elizabeth''s son, born to them in their old age?', array['Simeon', 'John (the Baptist)', 'Andrew', 'James'], 1, 'Luke 1:57-63'),
  (p, 5, 'What happened to Zacharias when he doubted the angel Gabriel''s message about having a son?', array['He was unable to speak until the child was born', 'He lost his eyesight', 'He fell asleep for many days', 'He was sent away from the temple'], 0, 'Luke 1:18-20'),
  (p, 5, 'Who was the old, righteous man in the temple who recognized baby Jesus as the promised Messiah and blessed Him?', array['Joseph of Arimathea', 'Simeon', 'Nicodemus', 'Zacharias'], 1, 'Luke 2:25-32'),
  (p, 5, 'Who was the elderly prophetess who also recognized baby Jesus in the temple?', array['Salome', 'Elizabeth', 'Anna', 'Joanna'], 2, 'Luke 2:36-38'),
  (p, 5, 'Which king ordered the killing of baby boys in Bethlehem after the wise men visited?', array['Archelaus', 'Herod Agrippa', 'Herod Antipas', 'Herod the Great'], 3, 'Matthew 2:16'),
  (p, 5, 'Where did Joseph and Mary flee with baby Jesus to escape Herod?', array['Cyprus', 'Damascus', 'Samaria', 'Egypt'], 3, 'Matthew 2:13-14'),
  (p, 5, 'At what age was Jesus found teaching in the temple, having stayed behind after Passover?', array['15', '10', '18', '12'], 3, 'Luke 2:41-49'),
  (p, 5, 'Which apostle is traditionally believed to have doubted least and was known as "the disciple whom Jesus loved"?', array['Andrew', 'John', 'Peter', 'James'], 1, 'John 21:20'),
  (p, 5, 'Which apostle''s mother asked Jesus if her sons could sit at His right and left hand in His kingdom?', array['James and John (sons of Zebedee)', 'Peter and Andrew', 'Philip and Bartholomew', 'Thomas and Matthew'], 0, 'Matthew 20:20-21'),
  (p, 5, 'Which apostle replaced Judas Iscariot among the twelve, chosen by casting lots?', array['Silas', 'Timothy', 'Matthias', 'Barnabas'], 2, 'Acts 1:23-26'),
  (p, 5, 'What was the name of the sorcerer in Samaria who tried to buy the power of the Holy Spirit from Peter?', array['Alexander', 'Bar-Jesus', 'Simon Magus (Simon the Sorcerer)', 'Elymas'], 2, 'Acts 8:9-24'),
  (p, 5, 'What happened to Ananias and Sapphira after they lied to the Holy Spirit about the money from selling their land?', array['They were forgiven and blessed', 'They were made servants', 'They both fell down dead', 'They were exiled'], 2, 'Acts 5:1-10'),
  (p, 5, 'Which city did Paul preach to the philosophers at the Areopagus (Mars Hill), about an "unknown god"?', array['Corinth', 'Ephesus', 'Athens', 'Rome'], 2, 'Acts 17:22-23'),
  (p, 5, 'What craft riot broke out in Ephesus against Paul, led by a silversmith who made idols?', array['A riot over unpaid taxes', 'A riot of Roman soldiers', 'A riot among fishermen', 'Demetrius the silversmith stirred up a riot over the goddess Artemis'], 3, 'Acts 19:23-29'),
  (p, 5, 'Which book of the Bible is a short personal letter from Paul asking for a runaway slave to be forgiven and welcomed back?', array['2 Timothy', 'Philemon', 'Titus', 'Jude'], 1, 'Philemon 1:10-18'),
  (p, 5, 'Who wrote the book of Revelation, and where was he when he received it?', array['The apostle John, on the island of Patmos', 'The apostle James, in Antioch', 'The apostle Peter, in Jerusalem', 'The apostle Paul, in Rome'], 0, 'Revelation 1:9'),
  (p, 5, 'How many churches does Jesus address directly at the start of the book of Revelation?', array['Three', 'Seven', 'Ten', 'Twelve'], 1, 'Revelation 1:11');
  insert into public.question_packs (name, faith) values ('Miracles', true) returning id into p;
  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (p, 1, 'What was Jesus'' very first recorded miracle?', array['Walking on water', 'Healing a blind man', 'Turning water into wine at a wedding', 'Feeding the 5,000'], 2, 'John 2:1-11'),
  (p, 1, 'How many people did Jesus feed with 5 loaves and 2 fish?', array['About 5,000', 'About 4,000', 'About 500', 'About 12'], 0, 'John 6:9-13'),
  (p, 1, 'What did Jesus do when a great storm scared His disciples on the boat?', array['He told them to swim to shore', 'He calmed the wind and waves', 'He woke everyone up to row harder', 'He jumped into the water'], 1, 'Mark 4:39'),
  (p, 1, 'Who did Jesus bring back to life after he had already been buried four days?', array['The widow''s son', 'John the Baptist', 'Jairus'' daughter', 'Lazarus'], 3, 'John 11:39-44'),
  (p, 2, 'How did Jesus heal ten men with leprosy?', array['He gave them water', 'He prayed over them for a day', 'He touched each one', 'He told them to go show themselves to the priests, and they were healed on the way'], 3, 'Luke 17:14'),
  (p, 2, 'How did Jesus heal a paralyzed man whose friends lowered him through a roof?', array['He gave him medicine', 'He forgave his sins and told him to get up and walk', 'He touched his legs', 'He sent him to a doctor'], 1, 'Mark 2:5-12'),
  (p, 2, 'How was the centurion''s servant healed even though Jesus never visited the house?', array['Jesus healed him in a dream', 'Jesus simply spoke the word, from a distance', 'The centurion touched Jesus'' robe', 'Jesus sent a disciple to touch him'], 1, 'Matthew 8:8-13'),
  (p, 2, 'What did the woman with the twelve-year bleeding problem do to be healed?', array['She washed in the Jordan River', 'She asked Jesus out loud first', 'A priest prayed over her', 'She touched the fringe of Jesus'' garment'], 3, 'Matthew 9:20-22'),
  (p, 2, 'How many baskets of leftovers were gathered after Jesus fed the 5,000?', array['2 baskets', '5 baskets', '12 baskets', '7 baskets'], 2, 'John 6:13'),
  (p, 2, 'How many baskets of leftovers were gathered after Jesus fed the 4,000?', array['7 baskets', '3 baskets', '12 baskets', '5 baskets'], 0, 'Matthew 15:37'),
  (p, 3, 'What miracle did Peter briefly share in with Jesus during a storm?', array['Calming the wind', 'Walking on water', 'Healing the sick', 'Multiplying bread'], 1, 'Matthew 14:28-31'),
  (p, 3, 'What miraculous catch of fish amazed Peter so much that he fell at Jesus'' knees?', array['A huge catch of fish that nearly broke the nets, after an empty night of fishing', 'A single golden fish', 'Fish that spoke to him', 'Fish that jumped straight into the boat'], 0, 'Luke 5:4-9'),
  (p, 3, 'What did Jesus find in the mouth of a fish to pay the temple tax, as He told Peter?', array['A ring', 'A pearl', 'A key', 'A coin'], 3, 'Matthew 17:24-27'),
  (p, 3, 'How did Jesus heal the man born blind, described in John chapter 9?', array['He gave the man new eyes miraculously appearing', 'He touched the man''s eyes with oil', 'He simply prayed aloud', 'He made mud with spit and told him to wash in the Pool of Siloam'], 3, 'John 9:1-7'),
  (p, 3, 'What miracle happened at Pentecost that allowed people from many nations to understand the disciples?', array['They spoke in other tongues (languages) by the Holy Spirit', 'A scroll appeared with the message', 'Everyone suddenly learned Hebrew', 'An angel translated for them'], 0, 'Acts 2:4'),
  (p, 3, 'What miracle freed Peter from prison in Acts, with his chains falling off?', array['Fellow believers bribed the guards', 'An earthquake broke the walls', 'An angel appeared and led him out past the guards', 'He picked the lock himself'], 2, 'Acts 12:7-10'),
  (p, 4, 'How did God provide water for Moses and the Israelites in the desert on one occasion?', array['A spring appeared overnight', 'Rain fell for forty days', 'Water came out of a rock when Moses struck it', 'An angel brought water in jars'], 2, 'Exodus 17:5-6'),
  (p, 4, 'What miracle did Elisha perform to help a poor widow pay her debts, involving oil?', array['Her jar of oil kept flowing to fill all the jars she borrowed', 'A stranger gave her oil', 'Oil rained from the sky', 'The oil turned to gold'], 0, '2 Kings 4:1-7'),
  (p, 4, 'What miracle did Elisha perform for the Shunammite woman?', array['He built her a house', 'He healed her blindness', 'He raised her son back to life', 'He gave her a fortune'], 2, '2 Kings 4:32-37'),
  (p, 4, 'How was the army commander Naaman healed of leprosy by Elisha?', array['He washed seven times in the Jordan River', 'He drank a special potion', 'He prayed for seven days', 'Elisha touched him'], 0, '2 Kings 5:10-14'),
  (p, 4, 'What miracle happened when Elijah threw his cloak over the Jordan River with Elisha?', array['The river turned to blood', 'The river parted so they could cross on dry ground', 'Fire fell from heaven onto the river', 'Fish jumped out onto the shore'], 1, '2 Kings 2:8'),
  (p, 5, 'What miracle happened to the sun during Joshua''s battle against the Amorites?', array['The sun stood still for about a whole day', 'The sun disappeared for a week', 'The sun turned red', 'The sun split in two'], 0, 'Joshua 10:12-13'),
  (p, 5, 'What miracle allowed Peter to walk with Jesus without paying regular fare, catching a fish with a coin?', array['A merchant gave Peter money', 'A coin was found inside a fish''s mouth', 'An angel handed Peter a coin', 'Peter found gold on the shore'], 1, 'Matthew 17:24-27'),
  (p, 5, 'What miraculous sign happened to Hezekiah as proof God would heal him and add years to his life?', array['The sun''s shadow moved backward on the stairway', 'A trumpet sounded from heaven', 'A dove landed on his bed', 'A star appeared at noon'], 0, '2 Kings 20:9-11'),
  (p, 5, 'What happened to the fire on the altar when Elijah challenged the prophets of Baal on Mount Carmel?', array['Rain put out the fire first', 'The wood would not light at all', 'God''s fire fell from heaven and consumed the soaked sacrifice', 'The fire went out immediately'], 2, '1 Kings 18:38');
  insert into public.question_packs (name, faith) values ('Parables', true) returning id into p;
  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (p, 1, 'What is the parable about a son who leaves home, wastes his money, and returns to a forgiving father called?', array['The Prodigal Son', 'The Sower', 'The Lost Sheep', 'The Good Samaritan'], 0, 'Luke 15:11-32'),
  (p, 1, 'What is the parable about a traveler who helps an injured stranger, ignored by others, called?', array['The Talents', 'The Good Samaritan', 'The Lost Coin', 'The Prodigal Son'], 1, 'Luke 10:25-37'),
  (p, 1, 'What is the parable about a shepherd who leaves 99 sheep to find 1 lost one called?', array['The Lost Coin', 'The Good Shepherd', 'The Lost Sheep', 'The Prodigal Son'], 2, 'Luke 15:3-7'),
  (p, 2, 'What is the parable about a farmer scattering seed on different types of ground called?', array['The Parable of the Wheat and Tares', 'The Parable of the Mustard Seed', 'The Parable of the Sower', 'The Parable of the Vineyard'], 2, 'Matthew 13:3-9'),
  (p, 2, 'What is the parable about a woman who searches her whole house for one lost silver coin called?', array['The Pearl of Great Price', 'The Lost Sheep', 'The Lost Coin', 'The Talents'], 2, 'Luke 15:8-10'),
  (p, 2, 'What is the parable where a master gives servants different amounts of money to invest called?', array['The Parable of the Ten Virgins', 'The Parable of the Talents', 'The Parable of the Vineyard Workers', 'The Parable of the Sower'], 1, 'Matthew 25:14-30'),
  (p, 2, 'What did the Good Samaritan do for the injured man that the priest and Levite did not?', array['Stopped, bandaged his wounds and paid for his care', 'Sent for the man''s family', 'Carried him all the way home', 'Simply prayed for him and left'], 0, 'Luke 10:33-35'),
  (p, 3, 'What is the parable about ten young women waiting for a bridegroom, five wise and five foolish, called?', array['The Wedding Feast', 'The Ten Virgins', 'The Sower', 'The Talents'], 1, 'Matthew 25:1-13'),
  (p, 3, 'What is the parable about weeds growing among good wheat until harvest time called?', array['The Sower', 'The Vineyard', 'The Mustard Seed', 'The Wheat and the Tares'], 3, 'Matthew 13:24-30'),
  (p, 3, 'What is the parable about a servant forgiven a huge debt who then refuses to forgive a small one called?', array['The Prodigal Son', 'The Good Samaritan', 'The Unforgiving Servant', 'The Rich Fool'], 2, 'Matthew 18:23-35'),
  (p, 3, 'What is the parable about a rich man who builds bigger barns but dies that very night called?', array['The Rich Young Ruler', 'The Unjust Steward', 'The Rich Fool', 'The Rich Man and Lazarus'], 2, 'Luke 12:16-21'),
  (p, 3, 'What is the parable comparing the kingdom of heaven to a tiny seed that grows into a huge tree called?', array['The Sower', 'The Mustard Seed', 'The Wheat and Tares', 'The Leaven'], 1, 'Matthew 13:31-32'),
  (p, 3, 'What is the parable about workers hired at different times of day, all paid the same wage, called?', array['The Talents', 'The Workers in the Vineyard', 'The Ten Virgins', 'The Great Banquet'], 1, 'Matthew 20:1-16'),
  (p, 4, 'What is the parable about a proud religious leader and a humble tax collector praying in the temple called?', array['The Pharisee and the Tax Collector', 'The Good Samaritan', 'The Rich Fool', 'The Prodigal Son'], 0, 'Luke 18:9-14'),
  (p, 4, 'What is the parable about a widow who kept pestering an unjust judge until he gave her justice called?', array['The Persistent Widow', 'The Lost Coin', 'The Unjust Steward', 'The Rich Fool'], 0, 'Luke 18:1-8'),
  (p, 4, 'What is the parable about people invited to a great feast who all make excuses not to come called?', array['The Great Banquet (Great Supper)', 'The Wedding Feast', 'The Prodigal Son', 'The Ten Virgins'], 0, 'Luke 14:16-24'),
  (p, 4, 'What is the parable about a poor beggar and a rich man, showing the afterlife, called?', array['The Rich Fool', 'The Prodigal Son', 'The Rich Man and Lazarus', 'The Good Samaritan'], 2, 'Luke 16:19-31'),
  (p, 4, 'What is the short parable about a merchant who sells everything to buy one fine pearl called?', array['The Hidden Treasure', 'The Leaven', 'The Mustard Seed', 'The Pearl of Great Price'], 3, 'Matthew 13:45-46'),
  (p, 4, 'What is the parable about a man who finds treasure buried in a field and sells all he has to buy it called?', array['The Hidden Treasure', 'The Vineyard', 'The Pearl of Great Price', 'The Talents'], 0, 'Matthew 13:44'),
  (p, 5, 'What is the parable about tenants who mistreat and kill the servants and son of a vineyard owner called?', array['The Great Banquet', 'The Workers in the Vineyard', 'The Wicked Tenants', 'The Barren Fig Tree'], 2, 'Matthew 21:33-41');
  insert into public.question_packs (name, faith) values ('Kings & Prophets', true) returning id into p;
  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (p, 1, 'Who was the wisest king of Israel, famous for the Temple and many proverbs?', array['Saul', 'Solomon', 'David', 'Hezekiah'], 1, '1 Kings 4:29-34'),
  (p, 1, 'Which king danced before the Lord as the Ark of the Covenant was brought into Jerusalem?', array['Saul', 'David', 'Solomon', 'Josiah'], 1, '2 Samuel 6:14-15'),
  (p, 2, 'Who was the wicked king of Israel married to Jezebel, opposed by Elijah?', array['Omri', 'Joram', 'Jehu', 'Ahab'], 3, '1 Kings 16:30-31'),
  (p, 2, 'Which king of Judah was only eight years old when he became king and led a major reform?', array['Uzziah', 'Hezekiah', 'Joash', 'Josiah'], 3, '2 Kings 22:1'),
  (p, 2, 'Which prophet confronted King David with the words "You are the man!" after his sin?', array['Elijah', 'Samuel', 'Nathan', 'Gad'], 2, '2 Samuel 12:7'),
  (p, 3, 'Which prophet anointed both Saul and David as kings of Israel?', array['Samuel', 'Ahijah', 'Nathan', 'Gad'], 0, '1 Samuel 10:1; 16:13'),
  (p, 3, 'Which king built the first Temple in Jerusalem?', array['David', 'Hezekiah', 'Josiah', 'Solomon'], 3, '1 Kings 6:1'),
  (p, 3, 'Which prophet is known for the vision of the fiery furnace and lions'' den stories, though he did not experience them himself in the furnace?', array['Jeremiah', 'Ezekiel', 'Daniel', 'Isaiah'], 2, 'Daniel is the one thrown into the lions'' den himself - his three friends survive the furnace. (Daniel 6:16)'),
  (p, 3, 'Which prophet''s writings are quoted the most in the New Testament, prophesying about the Messiah?', array['Ezekiel', 'Isaiah', 'Daniel', 'Jeremiah'], 1, 'Isaiah 53'),
  (p, 3, 'Which king of Israel became known for his brutal, fast chariot-driving and wiping out Ahab''s dynasty?', array['Zimri', 'Jehoram', 'Jehu', 'Omri'], 2, '2 Kings 9:20'),
  (p, 4, 'Which minor prophet preached repentance to Nineveh and got angry when God spared the city?', array['Habakkuk', 'Jonah', 'Micah', 'Nahum'], 1, 'Jonah 4:1'),
  (p, 4, 'Which minor prophet, a shepherd from Tekoa, preached against injustice to the wealthy in Israel?', array['Hosea', 'Obadiah', 'Joel', 'Amos'], 3, 'Amos 1:1'),
  (p, 4, 'Which minor prophet prophesied that the Messiah would be born in Bethlehem?', array['Habakkuk', 'Haggai', 'Zephaniah', 'Micah'], 3, 'Micah 5:2'),
  (p, 4, 'Which prophet encouraged the exiles to finish rebuilding the Temple after they had given up?', array['Zechariah', 'Haggai', 'Malachi', 'Joel'], 1, 'Haggai 1:1-8'),
  (p, 4, 'Which king of Judah was struck with leprosy for wrongly burning incense in the Temple?', array['Uzziah', 'Ahaz', 'Manasseh', 'Jotham'], 0, '2 Chronicles 26:16-21'),
  (p, 5, 'Which wicked king of Judah, Hezekiah''s son, is remembered for sacrificing his own children and later repenting?', array['Amon', 'Ahaz', 'Manasseh', 'Jehoiakim'], 2, '2 Chronicles 33:1-13'),
  (p, 5, 'Which king of Israel reigned for only seven days before taking his own life?', array['Shallum', 'Nadab', 'Zimri', 'Elah'], 2, '1 Kings 16:15'),
  (p, 5, 'Which prophet''s book is addressed almost entirely as a message of comfort to a coming remnant, closing the Old Testament with a promise of Elijah''s return?', array['Zechariah', 'Nahum', 'Micah', 'Malachi'], 3, 'Malachi 4:5-6'),
  (p, 5, 'Which king of Judah reigned the longest of all the kings, 55 years, despite much wickedness before his late repentance?', array['Josiah', 'Uzziah', 'Manasseh', 'Asa'], 2, '2 Kings 21:1'),
  (p, 5, 'Which prophet had visions of four beasts representing kingdoms, and the "Ancient of Days"?', array['Daniel', 'Ezekiel', 'Isaiah', 'Zechariah'], 0, 'Daniel 7:1-14');
  insert into public.question_packs (name, faith) values ('Who Am I?', true) returning id into p;
  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (p, 3, 'I am the only one of the Lord''s prophets left. Who am I?', array['Micaiah', 'Elijah', 'Elisha', 'Obadiah'], 1, '1 Kings 18:22'),
  (p, 1, 'I am the first king of Israel. Who am I?', array['Solomon', 'Saul', 'David', 'Samuel'], 1, '1 Samuel 10:24-26'),
  (p, 5, 'I am the father of King Ahab. Who am I?', array['Ahaziah', 'Jeroboam', 'Jehu', 'Omri'], 3, '1 Kings 16:29'),
  (p, 2, 'Shem, Ham, and I are Noah''s sons. Who am I?', array['Japheth', 'Lamech', 'Enoch', 'Seth'], 0, 'Genesis 6:10'),
  (p, 2, 'I pleaded with the Lord to spare my nephew Lot and his family from the destruction of Sodom and Gomorrah. Who am I?', array['Isaac', 'Abraham', 'Melchizedek', 'Moses'], 1, 'Genesis 18:16-33'),
  (p, 2, 'I am Jacob''s first wife. Who am I?', array['Leah', 'Rachel', 'Zilpah', 'Bilhah'], 0, 'Genesis 29:21-23'),
  (p, 5, 'I am the bronze serpent raised by Moses in the desert. What am I called?', array['Behemoth', 'The golden calf', 'Leviathan', 'Nehushtan'], 3, 'King Hezekiah later broke it in pieces because the people had started burning incense to it. (2 Kings 18:4)'),
  (p, 3, 'I was hired to curse the children of Israel but I couldn''t do it. Who am I?', array['Balaam', 'Korah', 'Bildad', 'Balak'], 0, 'Numbers 22'),
  (p, 2, 'Samuel asked, "Are these all the sons you have?" "There is still the youngest," Jesse replied, "but he is tending the sheep." Who am I?', array['Eliab', 'Abinadab', 'Solomon', 'David'], 3, '1 Samuel 16:11'),
  (p, 1, 'I asked God for wisdom. Who am I?', array['Hezekiah', 'Daniel', 'Solomon', 'David'], 2, '1 Kings 3:9'),
  (p, 3, 'I saw something like a great sheet filled with animals coming down from heaven. Who am I?', array['Paul', 'John', 'Cornelius', 'Peter'], 3, 'Acts 10:11-13'),
  (p, 4, 'I am a book of the Bible. Written in me are the words: "Come to me, all who labor and are heavy laden, and I will give you rest." Who am I?', array['John', 'Matthew', 'Psalms', 'Romans'], 1, 'Matthew 11:28'),
  (p, 1, 'I am the last plague of Egypt. What am I?', array['Locusts', 'Hail', 'Death of the firstborn', 'Darkness'], 2, 'Exodus 11:4-5'),
  (p, 4, 'Into me, God breathed the breath of life. What am I?', array['The ears', 'The nose (nostrils)', 'The heart', 'The mouth'], 1, '"The LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of life." (Genesis 2:7)'),
  (p, 3, 'I drove the tent peg through his temple into the ground, and he died. Who am I?', array['Rahab', 'Deborah', 'Delilah', 'Jael'], 3, 'The man was Sisera, commander of the Canaanite army. (Judges 4:18-21)'),
  (p, 2, 'I am a city. In me, the disciples were called Christians for the first time. Who am I?', array['Jerusalem', 'Antioch', 'Rome', 'Ephesus'], 1, 'Acts 11:26'),
  (p, 2, 'Paul says I am greater than any other gift the church may have. What am I?', array['Hope', 'Love', 'Faith', 'Prophecy'], 1, '1 Corinthians 13:1-2, 13'),
  (p, 1, 'I am Joshua''s father. Who am I?', array['Caleb', 'Jephunneh', 'Eleazar', 'Nun'], 3, 'Joshua 1:1'),
  (p, 5, 'I was one of Israel''s judges. I had 30 sons, who rode on 30 donkeys and had 30 cities. Who am I?', array['Tola', 'Gideon', 'Jair', 'Jephthah'], 2, 'Judges 10:3-4'),
  (p, 4, 'I was commander of the army of the king of Syria, and I was healed of leprosy by the prophet Elisha. Who am I?', array['Ben-Hadad', 'Naaman', 'Nebuchadnezzar', 'Hazael'], 1, '2 Kings 5:1-14');
  insert into public.question_packs (name, faith) values ('Books of the Bible', true) returning id into p;
  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (p, 2, 'What is the very first book of the Old Testament, about creation?', array['Genesis', 'Numbers', 'Leviticus', 'Exodus'], 0, 'Genesis 1:1'),
  (p, 2, 'Which book tells the story of Israel leaving slavery in Egypt?', array['Exodus', 'Leviticus', 'Genesis', 'Joshua'], 0, 'Exodus 1-14'),
  (p, 2, 'Which book is full of short wise sayings for daily living?', array['Proverbs', 'Psalms', 'Song of Songs', 'Ecclesiastes'], 0, 'Proverbs 1:1'),
  (p, 3, 'Which of the four Gospels was written by a doctor and also wrote the book of Acts?', array['Matthew', 'John', 'Mark', 'Luke'], 3, 'Colossians 4:14'),
  (p, 3, 'Which Gospel is believed to be the shortest and most fast-paced, often said to be written for Roman readers?', array['Mark', 'Matthew', 'Luke', 'John'], 0, 'Mark 1:1'),
  (p, 3, 'Which Gospel focuses heavily on Jesus fulfilling Old Testament prophecy, likely written for a Jewish audience?', array['Matthew', 'Mark', 'John', 'Luke'], 0, 'Matthew 1:22-23'),
  (p, 3, 'Which Gospel is well known for beginning with "In the beginning was the Word"?', array['Luke', 'Matthew', 'Mark', 'John'], 3, 'John 1:1'),
  (p, 3, 'Which book tells the story of the early church and Paul''s missionary journeys after Jesus'' ascension?', array['Romans', 'Acts', 'Revelation', 'Luke'], 1, 'Acts 1:1-8'),
  (p, 4, 'How many letters (epistles) in the New Testament are traditionally attributed to Paul?', array['9', '21', '13', '7'], 2, 'New Testament (Pauline epistles)'),
  (p, 4, 'Which New Testament book is famous for its detailed teaching on faith without works being dead?', array['James', 'Hebrews', '1 Peter', 'Jude'], 0, 'James 2:14-26'),
  (p, 4, 'Which book is often called the "Love Chapter" is actually a chapter within which New Testament letter?', array['Ephesians', '1 Corinthians (chapter 13)', 'Galatians', 'Romans'], 1, '1 Corinthians 13'),
  (p, 4, 'Which Old Testament book is a poetic love song traditionally attributed to Solomon?', array['Psalms', 'Song of Songs (Song of Solomon)', 'Lamentations', 'Proverbs'], 1, 'Song of Songs 1:1'),
  (p, 5, 'Which Old Testament book is a series of sad poems mourning the destruction of Jerusalem?', array['Lamentations', 'Job', 'Ecclesiastes', 'Habakkuk'], 0, 'Lamentations 1:1'),
  (p, 5, 'Which short New Testament letter warns strongly against false teachers and quotes the Old Testament book of Enoch?', array['2 John', 'Jude', 'Titus', '2 Peter'], 1, 'Jude 1:14-15'),
  (p, 5, 'Which New Testament letter is addressed "to the twelve tribes scattered among the nations" and was likely written by Jesus'' half-brother?', array['Jude', '1 Peter', 'James', 'Hebrews'], 2, 'James 1:1');
  insert into public.question_packs (name, faith) values ('Book of Joshua', true) returning id into p;
  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (p, 1, 'Who succeeded Moses as the leader of the Israelites?', array['Joshua', 'Caleb', 'Phinehas', 'Eleazar'], 0, 'Joshua 1:1-2'),
  (p, 1, 'What was the first city the Israelites conquered in the Promised Land?', array['Hazor', 'Gibeon', 'Jericho', 'Ai'], 2, 'Joshua 6'),
  (p, 3, 'Who were the spies sent to Jericho?', array['Two unnamed men', 'Phinehas and Eleazar', 'Joshua and Caleb', 'Joshua and Eleazar'], 0, 'Joshua 2:1'),
  (p, 2, 'What was the sign for the spies to look for in Jericho?', array['A red rope', 'A blue ribbon', 'A scarlet cord', 'A white flag'], 2, 'Joshua 2:18-21'),
  (p, 1, 'Who helped the spies in Jericho?', array['Eleazar', 'Caleb', 'Rahab', 'Achan'], 2, 'Joshua 2:1-6'),
  (p, 3, 'How did the Israelites march around Jericho on the last day?', array['Seven times on the first day', 'Once a day for seven days', 'Once a day for six days', 'Around the city seven times on the seventh day'], 3, 'They marched once a day for six days, then seven times on the seventh day. (Joshua 6:3-4, 15)'),
  (p, 1, 'What happened to the walls of Jericho?', array['They remained standing', 'They were destroyed by an earthquake', 'They fell down flat', 'They were breached by the Israelites'], 2, 'Joshua 6:20'),
  (p, 4, 'Who was the king of Ai?', array['A king whose name is not mentioned', 'Jabin', 'Joshua', 'Adoni-zedek'], 0, 'Joshua 8:23, 29'),
  (p, 2, 'What was the reason for the Israelites'' defeat at Ai?', array['Lack of preparation', 'Achan''s sin', 'Poor strategy', 'Lack of faith'], 1, 'Joshua 7:1-12'),
  (p, 2, 'How was Achan punished for his sin?', array['He was banished from the camp', 'He was given a warning', 'He was stoned to death', 'He was forgiven'], 2, 'Joshua 7:25'),
  (p, 4, 'Who led the southern coalition against the Israelites?', array['Caleb', 'Joshua', 'Adoni-zedek', 'Jabin'], 2, 'Adoni-zedek was king of Jerusalem - he joined four other kings against Gibeon. (Joshua 10:1-5)'),
  (p, 4, 'Who led the northern coalition against the Israelites?', array['Adoni-zedek', 'Joshua', 'Caleb', 'Jabin'], 3, 'Jabin was king of Hazor. (Joshua 11:1-5)'),
  (p, 3, 'How did the Israelites defeat the southern and northern coalitions?', array['Through military might and miraculous intervention', 'Through miraculous intervention only', 'Through military might only', 'Through diplomacy'], 0, 'God sent hailstones and made the sun stand still while Israel fought. (Joshua 10:11-14; 11:6-8)'),
  (p, 5, 'What was the extent of the land conquered by the Israelites?', array['From the Jordan River to the Mediterranean Sea', 'From Dan to Beersheba', 'From the wilderness to the Euphrates River', 'From the wilderness to Lebanon'], 2, 'The land is described in Joshua 11:16-23 and 12:7-24. (Joshua 1:4; 11:16-23)'),
  (p, 2, 'How was the land divided among the Israelites?', array['By lot', 'By the people''s choice', 'By Joshua''s decision', 'By the elders'' decision'], 0, 'Joshua 14:1-2'),
  (p, 5, 'What cities were given to the Levites?', array['Cities in the wilderness', 'All of the above', 'Cities in the mountains', 'Cities of refuge'], 1, 'The Levites received 48 cities, 6 of which were cities of refuge. (Joshua 21:41)'),
  (p, 3, 'Who was the last leader of the Israelites mentioned in the book of Joshua?', array['Eleazar', 'Joshua', 'Phinehas', 'Caleb'], 1, 'Joshua 24:29'),
  (p, 2, 'What was Joshua''s final message to the Israelites?', array['Make alliances with the nations around them', 'Worship idols and follow other gods', 'Settle in the wilderness', 'Serve the Lord and obey His commands'], 3, '"As for me and my house, we will serve the LORD." (Joshua 24:14-15)'),
  (p, 5, 'Where was Joshua buried?', array['Shiloh', 'Hebron', 'Timnath-serah', 'Shechem'], 2, 'Joshua 24:30'),
  (p, 1, 'Who was Joshua''s father?', array['Melchizedek', 'Eleazar', 'Nun', 'Shem'], 2, 'Joshua 1:1');
  insert into public.question_packs (name, faith) values ('General Bible Quiz', true) returning id into p;
  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (p, 1, 'How many lepers did Jesus heal at once, of whom only one came back to say thank you?', array['9', '11', '10', '12'], 2, 'Luke 17:11-19'),
  (p, 2, 'Who placed a curse on the city of Jericho?', array['Joshua', 'King Herod', 'Enoch', 'Moses'], 0, 'Joshua 6:26'),
  (p, 1, 'Which queen was eaten by dogs?', array['Joan', 'Deborah', 'Jezebel', 'Sapphira'], 2, '2 Kings 9:30-37'),
  (p, 2, 'What is called the food of the angels?', array['Manna', 'Pomegranate', 'Eggs', 'Milk'], 0, 'Psalm 78:25 says "Man did eat angels'' food" - speaking of the manna God sent from heaven. (Psalm 78:24-25)'),
  (p, 2, 'Naaman, the commander of the Syrian army, was cured of leprosy in which river?', array['Pharpar', 'Abana', 'Nile', 'Jordan'], 3, 'Naaman first complained that the rivers Abana and Pharpar back home were better! (2 Kings 5:12-14)'),
  (p, 3, 'Where was Saul installed as the king of Israel?', array['Gibeon', 'Gilgal', 'Horeb', 'Jerusalem'], 1, '1 Samuel 11:15'),
  (p, 3, 'Which of the following fathered Methuselah?', array['Adam', 'Gad', 'Enoch', 'Silas'], 2, 'Genesis 5:21; 1 Chronicles 1:3'),
  (p, 3, 'Who planned to kill Lazarus after he was raised from the dead?', array['The High Priest (chief priests)', 'A scribe', 'Nehemiah', 'Jonah'], 0, 'John 12:10'),
  (p, 4, 'What vice (evil) were the people of Crete known for?', array['Lying', 'Idol worship', 'Idleness', 'Kidnapping'], 0, 'Paul quotes one of their own prophets: "The Cretians are alway liars." (Titus 1:12)'),
  (p, 3, 'What kind of doctrine does Paul talk about in the book of Titus?', array['Fair doctrine', 'Special doctrine', 'Junk doctrine', 'Sound doctrine'], 3, 'Titus 2:1'),
  (p, 4, 'What vice (evil) did Paul tell Titus to advise older women to avoid?', array['Gossip (false accusing)', 'Anger', 'Hatred', 'Over-eating'], 0, 'Titus 2:3'),
  (p, 2, 'Which of these women carried two nations in her womb?', array['Naomi', 'Rebekah', 'Deborah', 'Ruth'], 1, 'The two nations were her twins, Jacob and Esau. (Genesis 25:23)'),
  (p, 5, 'Where did Paul tell Titus he had decided to spend the winter?', array['Nicopolis', 'Rome', 'Tarshish', 'Decapolis'], 0, 'Titus 3:12'),
  (p, 4, 'Which of these Bible characters blessed Pharaoh?', array['Isaac', 'Ahimelech', 'Abimelech', 'Jacob'], 3, 'Genesis 47:7-10'),
  (p, 5, 'Whom did Paul have in mind to send to Titus?', array['Aquila or Priscilla', 'Barnabas or Luke', 'Onesimus', 'Artemas or Tychicus'], 3, 'Titus 3:12'),
  (p, 2, 'Who was the father of Methuselah?', array['Enoch', 'Abel', 'Adam', 'Cain'], 0, 'Genesis 5:21'),
  (p, 3, 'Who designed the plan for the temple built by Solomon?', array['Jesse', 'Judah', 'David', 'God'], 2, 'David gave Solomon the pattern of the temple, which he said the Lord made him understand in writing. (1 Chronicles 28:11-19)'),
  (p, 5, 'Which of these had eighty-eight children?', array['King Rehoboam', 'Uzzah', 'Jael', 'Gideon'], 0, 'Rehoboam had 28 sons and 60 daughters. (2 Chronicles 11:21)'),
  (p, 1, 'In which city were the followers of Jesus first called Christians?', array['Rome', 'Babylon', 'Samaria', 'Antioch'], 3, 'Acts 11:26'),
  (p, 4, 'What were the Egyptians doing while the children of Israel were leaving Egypt?', array['Waving and cheering', 'Praying', 'Burying their firstborn', 'Shooting'], 2, 'Numbers 33:3-4'),
  (p, 1, 'Which of these statements is correct?', array['None of the above', 'Light and darkness are opposites', 'Darkness is heavier than light', 'Light and darkness are equal'], 1, 'Genesis 1:4; 1 John 1:5'),
  (p, 4, 'How many times did David have the chance to kill Saul but refuse?', array['2', '4', '5', '3'], 0, 'Once in a cave at En Gedi, and once in Saul''s camp while he slept. (1 Samuel 24:1-7; 26:7-12)'),
  (p, 3, 'Which army came to attack the Israelites after they left Egypt?', array['Amalekites', 'Hittites', 'Perizzites', 'Jebusites'], 0, 'Exodus 17:8'),
  (p, 3, 'How many brothers did Jesus have while on earth?', array['3', '1', '2', '4'], 3, 'James, Joseph (Joses), Simon and Judas. (Matthew 13:55)');
  insert into public.quests (title, summary, faith, sort) values ('Creation Week', 'Genesis Bible Journey: Genesis 1:1-2:3.', true, 10) returning id into qid;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (qid, 1, 'Creation Week: part 1', '🌌 Before anything else existed, God was already there. The Bible starts with six simple words: "In the beginning God created the heavens and the earth." (Genesis 1:1)

💡 The earth was dark and empty, like a room with the lights off. On Day 1, God said "Let there be light" - and light appeared, just like that. No tools, no waiting. Just His word. (Genesis 1:2-5)

🌊 On Day 2, God separated the sky from the waters. On Day 3, He gathered the water into oceans and made dry land appear, then filled it with trees, plants, and flowers. (Genesis 1:6-13)', 'How did God make light appear?', array['He flipped a switch', 'He used fire', 'He spoke, and it happened'], 2),
  (qid, 2, 'Creation Week: part 2', '☀️ On Day 4, God hung the sun in the sky to light the day, the moon to light the night, and scattered the stars everywhere. He made them to mark days, seasons, and years. (Genesis 1:14-19)

🐟 On Day 5, God filled the oceans with fish of every shape and size, and filled the sky with birds. Whales, tiny fish, eagles, sparrows - all made that day. (Genesis 1:20-23)

🦁 On Day 6, God made every land animal: lions, elephants, ants, giraffes. Every single one was His idea first. He looked at all of it and called it good. (Genesis 1:24-25)', 'What did God make on Day 5?', array['Land animals', 'The sun and moon', 'Fish and birds'], 2),
  (qid, 3, 'Creation Week: part 3', '🧑‍🤝‍🧑 On Day 6, God did something different. He made people - not just another animal, but someone made "in His own image," to be like Him in a special way. (Genesis 1:26-27)

🌳 God gave Adam and Eve a job: take care of the whole earth, the animals, and each other. He trusted them with something huge, right from the start. (Genesis 1:28)

🛌 On Day 7, God rested. Not because He was tired - God never gets tired - but to show that rest matters. He made the whole world in six days and then paused. (Genesis 2:1-3)', 'What makes people different from the animals God made?', array['People are made in God''s own image', 'People came first', 'People are bigger'], 0);
  insert into public.quests (title, summary, faith, sort) values ('The Garden and the Fall', 'Genesis Bible Journey: Genesis 2:8-3:24.', true, 11) returning id into qid;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (qid, 1, 'The Garden and the Fall: part 1', '🏡 God planted a beautiful garden called Eden and put Adam right in the middle of it, with every tree and fruit he could want - free to enjoy all of it. (Genesis 2:8-9)

🚫 There was one rule: don''t eat from the tree of the knowledge of good and evil. Just one. Out of an entire garden full of good things, God only said no to that one tree. (Genesis 2:16-17)

👩 God saw that Adam needed a companion, so He made Eve. The two of them lived together in the garden, walking and talking with God like friends. (Genesis 2:18-25)', 'How many trees in the garden were off-limits to Adam and Eve?', array['All of them', 'Ten', 'Just one'], 2),
  (qid, 2, 'The Garden and the Fall: part 2', '🐍 A crafty serpent asked Eve, "Did God really say you can''t eat from any tree?" - twisting the one small rule into something bigger, and planting doubt. (Genesis 3:1-5)

🍎 Eve ate the fruit and gave some to Adam, and he ate too. Right away, everything changed - they felt ashamed and hid from God for the first time ever. (Genesis 3:6-8)

💔 Their choice had real consequences: they had to leave the garden. But even then, God still cared for them and promised that one day, things would be made right again. (Genesis 3:15-24)', 'What did the serpent do to Eve?', array['Told her the truth kindly', 'Gave her a gift', 'Twisted God''s words and planted doubt'], 2);
  insert into public.quests (title, summary, faith, sort) values ('Two Brothers, Two Offerings', 'Genesis Bible Journey: Genesis 4:1-16.', true, 12) returning id into qid;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (qid, 1, 'Two Brothers, Two Offerings', '👨‍👦 Adam and Eve''s sons Cain and Abel each brought an offering to God. Abel brought his best; Cain didn''t bring his best - and God noticed the difference. (Genesis 4:1-5)

😠 Cain got angry that Abel''s offering pleased God and his didn''t. God warned Cain to deal with that anger before it controlled him - but Cain didn''t listen. (Genesis 4:6-7)

⚰️ Cain let his anger take over and hurt his brother. It was the first time jealousy led to something that couldn''t be undone - a hard lesson about where anger can lead. (Genesis 4:8-16)', 'Why did God warn Cain?', array['Because his anger was about to control him', 'Because Cain was hungry', 'Because Abel was in danger from an animal'], 0);
  insert into public.quests (title, summary, faith, sort) values ('Noah and the Flood', 'Genesis Bible Journey: Genesis 6:1-9:17.', true, 13) returning id into qid;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (qid, 1, 'Noah and the Flood: part 1', '😔 Many years after Adam and Eve, the world had grown full of people - and full of wrongdoing. God looked at the earth and was deeply grieved by what He saw. (Genesis 6:5-6)

⭐ But one man stood out: Noah. The Bible says Noah "found favor in the eyes of the Lord" - he tried to live rightly even when almost no one around him did. (Genesis 6:8-9)

🗣️ God told Noah His plan: a flood would come to wash the earth clean, but Noah and his family would be kept safe. Noah just had to trust and obey. (Genesis 6:13-18)', 'What made Noah stand out from everyone else?', array['He was the richest', 'He found favor with God by living rightly', 'He was the tallest'], 1),
  (qid, 2, 'Noah and the Flood: part 2', '🔨 God gave Noah exact instructions for a massive boat called an ark, built from cypress wood, coated in tar, with rooms inside for his family and every kind of animal. (Genesis 6:14-16)

🐘 Noah was told to bring two of every kind of animal on board - male and female - so life could continue after the flood. That''s a lot of animals to gather. (Genesis 6:19-20)

⏳ It likely took Noah decades to build the ark, with no rain in sight and neighbors probably laughing at him the whole time. Noah kept building anyway, exactly as God said. (Genesis 6:22)', 'How many of each kind of animal did Noah bring on the ark?', array['Two', 'Ten', 'One'], 0),
  (qid, 3, 'Noah and the Flood: part 3', '🌧️ Once the animals and Noah''s family were safely inside, God shut the door Himself. Rain fell for 40 days and 40 nights, and water covered the whole earth. (Genesis 7:11-12)

🌊 The water rose so high it covered even the tallest mountains. Everyone and everything outside the ark was gone - but Noah''s family and the animals stayed safe inside. (Genesis 7:17-23)

🕊️ The ark floated for months. Noah eventually sent out a dove to check for dry land, and when it came back with an olive leaf, he knew the water was going down. (Genesis 8:6-12)', 'How long did the rain fall?', array['7 days', '40 days and 40 nights', 'One day'], 1),
  (qid, 4, 'Noah and the Flood: part 4', '🐾 When the water finally dried up, Noah, his family, and every animal walked out onto dry land again. The first thing Noah did was build an altar and thank God. (Genesis 8:15-20)

🌈 God made a promise - a covenant - that He would never flood the whole earth again. As a sign of that promise, He set a rainbow in the sky. (Genesis 9:11-13)

🤝 That rainbow wasn''t just pretty - it was God''s reminder to every generation after Noah, including us, that He keeps His promises no matter how much time passes. (Genesis 9:16-17)', 'What sign did God put in the sky as a promise?', array['A cloud shaped like a boat', 'A rainbow', 'A star'], 1);
  insert into public.quests (title, summary, faith, sort) values ('One Language, One Tower', 'Genesis Bible Journey: Genesis 11:1-9.', true, 14) returning id into qid;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (qid, 1, 'One Language, One Tower', '🗣️ After the flood, everyone on earth spoke the same language. A group of people decided to build a massive tower "to reach the heavens" and make a name for themselves. (Genesis 11:1-4)

🏙️ The problem wasn''t the building itself - it was the reason behind it: pride, and trying to prove they didn''t need God at all. (Genesis 11:4)

🌍 God confused their language so they could no longer understand each other, and they scattered across the earth. That''s part of how so many different languages began. (Genesis 11:7-9)', 'What was the real problem with the tower?', array['It was made of the wrong material', 'It was too short', 'Pride, and trying to not need God'], 2);
  insert into public.quests (title, summary, faith, sort) values ('Abraham: Called, Promised, Tested', 'Genesis Bible Journey: Genesis 12:1-22:18.', true, 15) returning id into qid;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (qid, 1, 'Abraham: Called, Promised, Tested: part 1', '🎒 God told a man named Abram to leave his home, his city, and everything familiar, and go to a land God would show him later. Not now - later. (Genesis 12:1)

🤔 God didn''t give Abram a map or an address. Just a promise: "I will bless you and make you a great nation." Abram had to trust without knowing the details. (Genesis 12:2-3)

🐫 Abram packed up his family and everything he owned and left - at 75 years old - simply because God said so. That kind of trust is what he''s remembered for. (Genesis 12:4-9)', 'What did God give Abram to guide his journey?', array['A guide to walk with him', 'A promise, without knowing all the details', 'A detailed map'], 1),
  (qid, 2, 'Abraham: Called, Promised, Tested: part 2', '⭐ God changed Abram''s name to Abraham, meaning "father of many," and promised he''d have a son with his wife Sarah - even though they were both very old. (Genesis 17:5,15-16)

😂 When Sarah overheard this promise, she laughed - she was around 90! It sounded impossible. But nothing is too hard for God to do. (Genesis 18:11-14)

👶 A year later, Sarah gave birth to a son named Isaac, whose name means "he laughs" - turning her doubt into joy, exactly as God had promised. (Genesis 21:1-7)', 'Why did Sarah laugh when she heard the promise?', array['She was excited', 'She didn''t understand the words', 'It sounded impossible at her age'], 2),
  (qid, 3, 'Abraham: Called, Promised, Tested: part 3', '🤝 Abraham''s nephew Lot traveled with him. When their herdsmen started arguing over land, Abraham let Lot choose first - even though Abraham could have taken the best for himself. (Genesis 13:8-11)

🏙️ Lot chose to live near the cities of Sodom and Gomorrah, places full of wickedness. God decided to destroy those cities, but because Abraham asked, God agreed to rescue Lot''s family first. (Genesis 18:23-33; 19:1-16)

🏃 Angels helped Lot''s family escape just before the cities were destroyed, warning them not to look back. It''s a story about how far God''s mercy reaches for the people we care about. (Genesis 19:17-29)', 'What did Abraham do when there was a dispute over land?', array['Let Lot choose first', 'Took the best land for himself', 'Kicked Lot out'], 0),
  (qid, 4, 'Abraham: Called, Promised, Tested: part 4', '⛰️ Years later, God tested Abraham in the hardest way possible: asking him to offer his beloved son Isaac as a sacrifice on a mountain. Abraham obeyed and set out, trusting God completely. (Genesis 22:1-3)

🐏 Just as Abraham raised his hand, an angel stopped him. God had provided a ram to sacrifice instead - He never intended for Isaac to actually be harmed. It was a test of trust. (Genesis 22:10-13)

🙏 Because Abraham trusted God even when it made no sense, God renewed His promise: Abraham''s family would become a blessing to every nation on earth. (Genesis 22:15-18)', 'What stopped Abraham at the last moment?', array['An angel stopped him', 'He changed his mind', 'Isaac ran away'], 0);
  insert into public.quests (title, summary, faith, sort) values ('A Wife for Isaac', 'Genesis Bible Journey: Genesis 24:1-67.', true, 16) returning id into qid;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (qid, 1, 'A Wife for Isaac', '🐪 Abraham sent his servant on a long journey to find the right wife for Isaac, praying for a clear sign to know who she was when he found her. (Genesis 24:1-14)

💧 At a well, a kind young woman named Rebekah offered water not just to the servant but to all his camels too - exactly matching the sign he''d prayed for. (Genesis 24:15-20)

💑 Rebekah agreed to travel back and marry Isaac, even though it meant leaving her whole family behind. Isaac loved her, and their story shows how God guides even small, everyday choices. (Genesis 24:58-67)', 'What did Rebekah do that matched the servant''s prayer for a sign?', array['She ran away', 'She gave water to him and his camels', 'She sang a song'], 1);
  insert into public.quests (title, summary, faith, sort) values ('Jacob: Trickery to Israel', 'Genesis Bible Journey: Genesis 25:19-32:32.', true, 17) returning id into qid;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (qid, 1, 'Jacob: Trickery to Israel: part 1', '👬 Isaac and Rebekah had twin sons, Esau and Jacob. Esau traded away his birthright - his special place as the older son - for a bowl of stew because he was hungry. (Genesis 25:29-34)

🎭 Later, Jacob and his mother tricked Isaac, who couldn''t see well, into giving Jacob the blessing meant for Esau. It wasn''t an honest way to get it. (Genesis 27:18-29)

🏃 Esau was furious when he found out, and Jacob had to run away from home for years. Trickery got Jacob the blessing, but it cost him his family peace for a long time. (Genesis 27:41-45)', 'What did Esau trade his birthright for?', array['A bowl of stew', 'Gold', 'A new tent'], 0),
  (qid, 2, 'Jacob: Trickery to Israel: part 2', '🌙 While running from Esau, Jacob stopped for the night, alone and afraid, using a rock as a pillow. That night God gave him an unforgettable dream. (Genesis 28:10-11)

🪜 Jacob dreamed of a stairway reaching from earth to heaven, with angels going up and down it, and God standing at the top, speaking directly to him. (Genesis 28:12-13)

✨ God repeated to Jacob the same promise He''d made to Abraham, and added something personal: "I am with you and will watch over you wherever you go." (Genesis 28:13-15)', 'What did Jacob see going up and down the stairway in his dream?', array['Clouds', 'Angels', 'Birds'], 1),
  (qid, 3, 'Jacob: Trickery to Israel: part 3', '🌃 Years later, on his way home, Jacob spent a night wrestling with a mysterious figure - which turned out to be an encounter with God Himself. (Genesis 32:24-25)

💪 Jacob refused to let go, even after being hurt, saying "I will not let you go unless you bless me." His whole life had been about grabbing for blessings - this time, honestly. (Genesis 32:26)

👑 God gave Jacob a new name: Israel, meaning "he struggles with God." The nation of Israel is named after this one moment of a man who refused to give up on God. (Genesis 32:28)', 'What did Jacob refuse to do during the struggle?', array['Run away', 'Let go without receiving a blessing', 'Speak'], 1);
  insert into public.quests (title, summary, faith, sort) values ('The Dreamer, Sold and Tested', 'Genesis Bible Journey: Genesis 37:1-39:23.', true, 18) returning id into qid;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (qid, 1, 'The Dreamer, Sold and Tested: part 1', '🧥 Jacob had twelve sons, but Joseph was his favorite - so much so that he gave Joseph a special colorful robe. His older brothers noticed, and it made them jealous. (Genesis 37:3-4)

💤 Joseph had dreams that hinted he''d one day lead his whole family. He told his brothers about them - which, understandably, made them even angrier. (Genesis 37:5-9)

😡 The jealousy in Joseph''s family grew so strong that his own brothers could barely speak to him kindly anymore. A dangerous situation was building. (Genesis 37:4,11)', 'Why were Joseph''s brothers jealous of him?', array['He was the tallest', 'He was the oldest', 'He was their father''s favorite'], 2),
  (qid, 2, 'The Dreamer, Sold and Tested: part 2', '🕳️ Joseph''s brothers got so angry they threw him into a pit and considered killing him. Instead, they decided to sell him as a slave to traders passing by. (Genesis 37:23-28)

🐫 Joseph was sold for twenty pieces of silver and carried far away to Egypt - a slave, torn from his family, with no idea what would happen next. (Genesis 37:28)

💔 The brothers lied to their father Jacob, telling him Joseph had been killed by a wild animal. Jacob grieved deeply, not knowing the truth. (Genesis 37:31-35)', 'What did Joseph''s brothers do to him?', array['Sold him as a slave', 'Sent him on vacation', 'Gave him a promotion'], 0),
  (qid, 3, 'The Dreamer, Sold and Tested: part 3', '🏠 In Egypt, Joseph became a slave in the house of a man named Potiphar. Even in a hard situation, Joseph worked so well that he was put in charge of the whole household. (Genesis 39:1-6)

🙅 Potiphar''s wife tried to get Joseph to do something wrong. Joseph refused, even though it would have been easy to give in. He chose to do right, even unseen. (Genesis 39:7-12)

⛓️ She lied about him afterward, and Joseph ended up unfairly thrown in prison - punished for doing the right thing. But even there, God stayed with him. (Genesis 39:19-23)', 'What did Joseph do when he was tempted to do wrong?', array['He gave in', 'He ran to tell everyone', 'He refused and chose to do right'], 2);
  insert into public.quests (title, summary, faith, sort) values ('Pharaoh''s Dreams and Forgiveness', 'Genesis Bible Journey: Genesis 41:1-45:15.', true, 19) returning id into qid;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (qid, 1, 'Pharaoh''s Dreams and Forgiveness: part 1', '👑 Years later, Egypt''s Pharaoh had strange dreams no one could explain. Someone remembered that Joseph, still in prison, had a gift for understanding dreams. (Genesis 41:1-13)

🌾 Joseph explained that the dreams meant seven years of plenty were coming, followed by seven years of famine - and gave Pharaoh a wise plan to prepare. (Genesis 41:25-36)

🏛️ Pharaoh was so impressed that he made Joseph second-in-command over all of Egypt - the former slave and prisoner now ran the whole country''s food supply. (Genesis 41:39-41)', 'What did Joseph''s interpretation of the dreams predict?', array['A war coming', 'Seven years of plenty, then seven years of famine', 'A flood'], 1),
  (qid, 2, 'Pharaoh''s Dreams and Forgiveness: part 2', '🌾 The famine hit Joseph''s home country too. His brothers traveled to Egypt for food, not realizing the powerful official in charge was the brother they''d sold years earlier. (Genesis 42:1-8)

😭 Joseph eventually revealed who he was. His brothers were terrified, expecting revenge for what they''d done. Instead, Joseph wept and embraced them. (Genesis 45:1-4)

❤️ "Don''t be afraid," Joseph told them. "God turned what you meant for harm into a way to save many lives." He chose forgiveness over revenge, and it changed everything. (Genesis 45:5-8)', 'How did Joseph''s brothers expect him to react when they found out who he was?', array['With revenge', 'With indifference', 'With laughter'], 0);
  insert into public.quests (title, summary, faith, sort) values ('Big Truths from Genesis', 'Genesis Bible Journey: Genesis 1-50 (selected passages).', true, 20) returning id into qid;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (qid, 1, 'Big Truths from Genesis: part 1', '🎨 Everything in creation - every star, every animal, every color - was on purpose. God didn''t make the world by accident; He designed it, piece by piece. (Genesis 1:1)

🪞 And of everything He made, only people were made "in God''s image." That means you were made on purpose too, and you matter to God more than you might realize. (Genesis 1:27)', 'Which of these was made "in God''s image"?', array['Animals', 'The sun', 'People'], 2),
  (qid, 2, 'Big Truths from Genesis: part 2', '⚖️ Adam and Eve''s choice in the garden and Cain''s jealousy toward Abel both show the same pattern: sin might feel small at first, but it always leads somewhere real. (Genesis 3:6; 4:8)

🌱 The good news is that even after both of those failures, God didn''t walk away. He kept caring for Adam''s family, and kept working His plan forward. (Genesis 3:21; 4:15)', 'What pattern do Adam and Eve''s choice and Cain''s choice both show?', array['Sin has no effect', 'Sin always leads somewhere real', 'Only adults sin'], 1),
  (qid, 3, 'Big Truths from Genesis: part 3', '🌈 God promised Noah no flood would ever destroy the whole earth again, and put a rainbow in the sky as a sign. That promise has held for thousands of years. (Genesis 9:13)

⭐ God also promised Abraham a family as countless as the stars, even though Abraham was old and it seemed impossible. Both promises came true, exactly as God said. (Genesis 15:5-6)', 'What sign did God give as a reminder of His promise to Noah?', array['A rainbow', 'A star', 'A mountain'], 0),
  (qid, 4, 'Big Truths from Genesis: part 4', '🧭 Abraham left his home without knowing exactly where he was going, and later was willing to trust God even on the mountain with Isaac. Both times, he obeyed before he understood. (Genesis 12:1; 22:2-3)

💫 That''s what faith really is: trusting God''s character even when His plan doesn''t fully make sense yet. Abraham is remembered for that kind of trust to this day. (Genesis 22:12)', 'What did Abraham do both times, before he fully understood the plan?', array['He obeyed anyway', 'He asked someone else to go instead', 'He refused'], 0),
  (qid, 5, 'Big Truths from Genesis: part 5', '🤗 Joseph had every reason to be angry with his brothers - they sold him into slavery. But when he had the power to punish them, he chose to forgive instead. (Genesis 45:4-5)

🌟 Joseph saw that God had used even his brothers'' worst choice for something good. Forgiveness didn''t mean pretending it didn''t hurt - it meant letting go of revenge. (Genesis 50:19-21)', 'What did Joseph choose to do when he had the power to punish his brothers?', array['Punish them severely', 'Ignore them forever', 'Forgive them'], 2),
  (qid, 6, 'Big Truths from Genesis: part 6', '🌍 God told Jacob, running scared from home, "I am with you wherever you go." Not just at home, not just in comfortable places - everywhere. (Genesis 28:15)

⛓️ Joseph experienced the same truth in the hardest places: a pit, a prison, a foreign country. The Bible says "the Lord was with Joseph" through every single one of them. (Genesis 39:2-3,21)', 'Where was God with Jacob and Joseph?', array['Only at home', 'Everywhere, including the hardest places', 'Only in good times'], 1);
  insert into public.question_packs (name, faith) values ('Genesis Journey', true) returning id into p;
  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (p, 1, 'What are the very first words of the Bible?', array['"Let there be light"', '"God rested"', '"Once upon a time"', '"In the beginning God created the heavens and the earth"'], 3, 'Genesis 1:1 opens the whole Bible with exactly that line.'),
  (p, 1, 'What did God separate on Day 2?', array['Nothing at all', 'Land and sea', 'The sky and the waters', 'Day and night only'], 2, 'Genesis 1:6-8 describes God separating the sky from the waters below.'),
  (p, 2, 'Which book of the Bible is this story found in?', array['Psalms', 'Genesis', 'Matthew', 'Exodus'], 1, 'Genesis is the very first book of the Bible, and this is its opening story.'),
  (p, 2, 'What did God put in the sky on Day 4?', array['Clouds only', 'Birds', 'Nothing yet', 'The sun, moon, and stars'], 3, 'Genesis 1:16 says God made the sun, moon, and stars on Day 4.'),
  (p, 3, 'What did God make on Day 6?', array['Oceans', 'Land animals', 'Stars', 'Light'], 1, 'Lions, elephants, ants, and giraffes were all made on Day 6.'),
  (p, 3, 'What did God say about everything He made?', array['It was boring', 'It was a mistake', 'It was unfinished', 'It was good'], 3, 'Genesis 1:25 says God saw that it was good.'),
  (p, 4, 'What did God make that was different from every animal?', array['A robot', 'A bigger animal', 'People, made in His own image', 'Nothing new at all'], 2, 'Genesis 1:27 says people alone were made in God''s own image.'),
  (p, 4, 'What did God do on Day 7?', array['Made more animals', 'Created the sun', 'Flooded the earth', 'Rested'], 3, 'After six days of creating, God rested on the seventh.'),
  (p, 5, '"Made in God''s image" means what?', array['People are robots', 'People are exactly the same as God', 'It means nothing', 'People are made to be like Him in a special way'], 3, 'It means people reflect God in a unique way no animal does.'),
  (p, 5, 'What''s the big takeaway from Creation Week?', array['The world made itself', 'God is still creating new planets today', 'None of it matters', 'God made everything on purpose, including people'], 3, 'Every day of creation, including people, happened on purpose by God''s design.'),
  (p, 1, 'What was the name of the garden God made?', array['Nazareth', 'Eden', 'Canaan', 'Egypt'], 1, 'God planted the Garden of Eden and placed Adam in it.'),
  (p, 1, 'What was the one rule God gave?', array['Don''t eat from the tree of the knowledge of good and evil', 'Never leave Eden', 'Don''t talk to animals', 'Never sleep in the garden'], 0, 'That single tree was the only thing off-limits.'),
  (p, 2, 'Why did God make Eve?', array['Adam needed a companion', 'Adam asked for a servant', 'The animals wanted a friend', 'No reason is given'], 0, 'God saw Adam needed someone to share life with.'),
  (p, 2, 'What does this story show about how God treats people?', array['He never explains anything', 'He is generous and gives real freedom', 'He gives no freedom at all', 'He hides everything from people'], 1, 'God gave Adam an entire garden of freedom, with just one boundary.'),
  (p, 3, 'How did the serpent twist God''s rule?', array['He said it kindly', 'He gave a gift instead', 'He obeyed it himself', 'He made it sound like a bigger restriction than it was'], 3, 'The serpent exaggerated the one rule into "any tree" to plant doubt.'),
  (p, 3, 'What happened right after Adam and Eve ate the fruit?', array['They felt ashamed and hid', 'Nothing changed', 'They became invisible', 'God ignored them'], 0, 'Shame and hiding from God happened immediately.'),
  (p, 4, 'What real consequence did Adam and Eve face?', array['They were given more trees', 'Nothing happened to them', 'They became animals', 'They had to leave the garden'], 3, 'Their sin had a real, lasting consequence: leaving Eden.'),
  (p, 4, 'What is the overall lesson of Genesis 3?', array['Nothing bad ever happens from sin', 'Snakes are dangerous animals', 'God abandoned Adam and Eve forever', 'Sin has real consequences, but God still cares'], 3, 'The Fall shows both the seriousness of sin and God''s continued care.'),
  (p, 1, 'Who were Cain and Abel?', array['Adam and Eve''s sons', 'Abraham''s servants', 'Noah''s sons', 'Strangers'], 0, 'They were the sons of Adam and Eve.'),
  (p, 1, 'What made God notice a difference between the two offerings?', array['Abel brought his best', 'They looked the same', 'Cain brought more', 'Neither brought anything'], 0, 'Abel''s offering was his best; Cain''s wasn''t.'),
  (p, 2, 'What did God warn Cain to do?', array['Bring a bigger offering', 'Ignore Abel', 'Deal with his anger before it controlled him', 'Leave home'], 2, 'God gave Cain a chance to master his anger before it went further.'),
  (p, 2, 'What did Cain''s anger lead him to do?', array['Leave peacefully', 'Bring a better offering', 'Hurt his brother', 'Apologize to Abel'], 2, 'His unchecked anger led to something that could not be undone.'),
  (p, 3, 'What is this story a hard lesson about?', array['Where jealousy and anger can lead', 'Building houses', 'Farming', 'Cooking food'], 0, 'It shows how unchecked jealousy and anger can lead somewhere serious.'),
  (p, 1, 'What had the world grown full of by Noah''s time?', array['Wealth', 'Music', 'Wrongdoing', 'Peace'], 2, 'Genesis 6:5 describes how full of wrongdoing the earth had become.'),
  (p, 1, 'Who stood out as different from everyone else?', array['Noah', 'Everyone equally', 'Noah''s neighbors', 'No one'], 0, 'Noah tried to live rightly even surrounded by wrongdoing.'),
  (p, 2, 'What was the ark made of?', array['Ice', 'Stone', 'Metal', 'Cypress wood'], 3, 'God instructed Noah to build the ark from cypress wood.'),
  (p, 2, 'How many of each animal did Noah bring aboard?', array['Ten', 'One', 'Two, male and female', 'A hundred'], 2, 'Two of each kind ensured life could continue after the flood.'),
  (p, 3, 'Who shut the door of the ark?', array['God Himself', 'Noah', 'Nobody, it locked on its own', 'One of the animals'], 0, 'God Himself shut the door once everyone was safely inside.'),
  (p, 3, 'How long did the rain fall?', array['40 days and 40 nights', 'A whole year', 'One day', '7 days'], 0, 'The rain fell continuously for 40 days and 40 nights.'),
  (p, 4, 'What did the dove bring back to show land was near?', array['An olive leaf', 'Nothing', 'A fish', 'A rock'], 0, 'The olive leaf showed that dry land and plants were reappearing.'),
  (p, 4, 'What did God promise never to do again?', array['Talk to people', 'Make more animals', 'Flood the whole earth', 'Send rain at all'], 2, 'God promised never again to flood the entire earth.'),
  (p, 5, 'What sign did God give as a reminder of that promise?', array['A mountain', 'A star', 'A rainbow', 'A tree'], 2, 'The rainbow was set in the sky as the sign of the covenant.'),
  (p, 5, 'What is the biggest lesson of this whole Noah story?', array['Rain is dangerous', 'God keeps His promises', 'Boats are useful', 'Animals can''t swim'], 1, 'From the flood to the rainbow, the story shows God''s faithfulness to His word.'),
  (p, 1, 'What did all people on earth share before Babel?', array['The same food', 'The same language', 'The same house', 'The same clothes'], 1, 'Everyone spoke one common language before this story.'),
  (p, 1, 'Why did the people want to build the tower?', array['To reach the heavens and make a name for themselves', 'To trade with other cities', 'To store grain', 'To hide from a flood'], 0, 'Their goal was pride-driven - reaching the heavens and gaining fame.'),
  (p, 2, 'What was the real problem behind the tower?', array['It was too short', 'The wrong building material', 'Pride and trying not to need God', 'It was in the wrong location'], 2, 'The issue was the prideful motive, not the construction itself.'),
  (p, 2, 'What happened after God confused their language?', array['Nothing changed', 'They built a bigger tower', 'They stopped talking forever', 'They scattered across the earth'], 3, 'Unable to understand each other, the people scattered across the earth.'),
  (p, 3, 'What is the main lesson of the Tower of Babel?', array['Tall buildings are always wrong', 'Languages never change', 'Pride that pushes God aside leads somewhere different than planned', 'Cities should never be built'], 2, 'The story warns about pride and self-sufficiency apart from God.'),
  (p, 1, 'How old was Abram when he left his home?', array['75', '100', '25', '50'], 0, 'Abram was 75 years old when he obeyed and left.'),
  (p, 1, 'What promise did God give Abram?', array['To make him a king right away', 'Nothing specific', 'To make him a great nation', 'To give him a house nearby'], 2, 'God promised to bless Abram and make him a great nation.'),
  (p, 2, 'What was Abram''s name changed to?', array['Abraham', 'Israel', 'Isaac', 'Jacob'], 0, 'God renamed Abram to Abraham, meaning "father of many."'),
  (p, 2, 'Why did Sarah laugh at the promise?', array['It sounded impossible at her age', 'She was joking', 'She was excited', 'She didn''t understand'], 0, 'At around 90 years old, having a baby seemed impossible to her.'),
  (p, 3, 'What was Isaac''s name a reminder of?', array['A city', 'A hard journey', 'Sarah''s laughter turning to joy', 'A big mountain'], 2, '"Isaac" means "he laughs," turning her earlier doubt into joy.'),
  (p, 3, 'What did Abraham do about the land dispute with Lot?', array['Let Lot choose first', 'Ignored the problem', 'Took the best land for himself', 'Kicked Lot out'], 0, 'Abraham generously let Lot choose first, even though he could have taken the best.'),
  (p, 4, 'Why did God rescue Lot''s family before destroying the cities?', array['Lot demanded it', 'By random chance', 'It wasn''t on purpose', 'Because Abraham asked'], 3, 'God agreed to rescue Lot''s family specifically because Abraham interceded for them.'),
  (p, 4, 'What did God ask Abraham to do on the mountain?', array['Fight a battle', 'Offer his son Isaac as a sacrifice', 'Build a temple', 'Move to Egypt'], 1, 'This was the hardest test God gave Abraham.'),
  (p, 5, 'What did God provide instead of Isaac?', array['A dove', 'A ram', 'Nothing', 'Gold'], 1, 'God provided a ram to be sacrificed in Isaac''s place.'),
  (p, 5, 'What is the main lesson across Abraham''s story?', array['Trusting God even without knowing every detail', 'Maps are unnecessary in life', 'Age prevents new beginnings', 'Never leaving home'], 0, 'Abraham''s obedience despite uncertainty, again and again, is the heart of his story.'),
  (p, 1, 'Who did Abraham send to find a wife for Isaac?', array['Sarah', 'His servant', 'Isaac himself', 'A stranger'], 1, 'Abraham sent his trusted servant on this journey.'),
  (p, 1, 'Where did the servant meet Rebekah?', array['At a wedding', 'In a marketplace', 'In a tent', 'At a well'], 3, 'Rebekah came to draw water at a well, where the servant waited.'),
  (p, 2, 'What did Rebekah give up to marry Isaac?', array['Her name', 'Her animals', 'Her whole family and home', 'Nothing'], 2, 'She left her entire family behind to travel and marry Isaac.'),
  (p, 2, 'What does this story show about how God guides people?', array['Only big miracles count as guidance', 'Even small, everyday choices can be guided by God', 'God is uninvolved in daily life', 'God never guides small decisions'], 1, 'A simple act of kindness at a well became a clear sign from God.'),
  (p, 3, 'What is the main lesson from this story?', array['Servants should never travel alone', 'Marriages never need guidance', 'Wells are always important', 'God can guide even ordinary, everyday moments'], 3, 'This story highlights how God works through everyday details.'),
  (p, 1, 'What did Esau trade his birthright for?', array['Gold', 'A new tent', 'A bowl of stew', 'Nothing, he kept it'], 2, 'Esau gave up his birthright out of hunger for a simple bowl of stew.'),
  (p, 1, 'How did Jacob get Isaac''s blessing?', array['Isaac gave it freely', 'By tricking his father', 'Esau gave it to him', 'He never got it'], 1, 'Jacob and his mother deceived Isaac to get the blessing meant for Esau.'),
  (p, 2, 'What did Jacob''s trickery cost him?', array['His family''s peace for years', 'His name', 'Nothing', 'His health'], 0, 'Jacob had to flee and lost years of peace with his family.'),
  (p, 2, 'What did Jacob see in his dream on the way out of town?', array['A stairway to heaven with angels', 'A tower', 'A garden', 'A flood'], 0, 'He dreamed of a stairway reaching from earth to heaven, with angels on it.'),
  (p, 3, 'What personal promise did God add for Jacob in that dream?', array['"You will never struggle again"', '"I will make you rich"', '"I am with you wherever you go"', 'Nothing new'], 2, 'God personally promised His presence and protection to Jacob.'),
  (p, 3, 'Who did Jacob discover he had been wrestling with, years later?', array['Esau', 'A stranger', 'An animal', 'God Himself'], 3, 'The struggle turned out to be an encounter with God.'),
  (p, 4, 'What new name did God give Jacob?', array['Isaac', 'Esau', 'Abram', 'Israel'], 3, 'God renamed Jacob "Israel" after this encounter.'),
  (p, 4, 'What does this story show about persistence with God?', array['Names never change', 'Holding on to God, even through struggle, brings blessing', 'Struggling with God always ends badly', 'It''s better to avoid God entirely'], 1, 'Jacob''s refusal to let go led to a real, honest blessing.'),
  (p, 1, 'What special gift did Jacob give Joseph?', array['A colorful robe', 'A horse', 'Land', 'A sword'], 0, 'Jacob gave Joseph a special colorful robe as a sign of favor.'),
  (p, 1, 'What did Joseph''s dreams hint at?', array['He''d become a farmer', 'Nothing important', 'He''d one day lead his family', 'A famine coming'], 2, 'Joseph''s dreams suggested he would one day lead his family.'),
  (p, 2, 'Why were Joseph''s brothers jealous of him?', array['He was the tallest', 'He had more sheep', 'He was the oldest', 'He was their father''s favorite'], 3, 'Joseph being their father''s clear favorite fueled the jealousy.'),
  (p, 2, 'What did the brothers do instead of killing Joseph?', array['Nothing', 'Sold him as a slave', 'Let him go home', 'Made him a servant at home'], 1, 'They sold Joseph as a slave to passing traders.'),
  (p, 3, 'What lie did the brothers tell Jacob?', array['Joseph got married', 'Joseph ran away', 'A wild animal killed Joseph', 'Joseph became rich'], 2, 'They lied that a wild animal had killed Joseph.'),
  (p, 3, 'Where was Joseph taken?', array['Rome', 'Egypt', 'Babylon', 'Greece'], 1, 'Joseph was carried far away to Egypt.'),
  (p, 4, 'What did Joseph do when tempted by Potiphar''s wife?', array['He gave in', 'He ignored it', 'He refused and chose to do right', 'He told everyone right away'], 2, 'Joseph chose to do right even when it would have been easy to give in.'),
  (p, 4, 'Who stayed with Joseph even in prison?', array['His brothers', 'God', 'No one', 'Potiphar'], 1, 'The Bible says God stayed with Joseph even in that hard place.'),
  (p, 5, 'What does this part of the story show about doing right when it''s hard?', array['It sometimes leads to unfair suffering, but God remains present', 'It never matters what you choose', 'It always leads to instant reward', 'Doing wrong is always safer'], 0, 'Joseph''s integrity led to unfair suffering, yet God never left him.'),
  (p, 1, 'What problem did Pharaoh have?', array['A famine already happening', 'A missing crown', 'A rebellion', 'Strange dreams no one could explain'], 3, 'Pharaoh''s dreams troubled him and no one could interpret them.'),
  (p, 1, 'What did Joseph''s interpretation predict?', array['Nothing important', 'A flood', 'Seven years of plenty, then seven years of famine', 'A war coming'], 2, 'Joseph explained the dreams meant seven good years followed by seven hard ones.'),
  (p, 2, 'What position did Pharaoh give Joseph?', array['Second-in-command over Egypt', 'A prisoner again', 'Nothing, he sent him home', 'A shepherd'], 0, 'Pharaoh made Joseph second-in-command over the whole country.'),
  (p, 2, 'Why did Joseph''s brothers travel to Egypt?', array['For a festival', 'To find Joseph on purpose', 'For food during a famine', 'To trade animals'], 2, 'A famine forced them to travel to Egypt seeking food.'),
  (p, 3, 'How did the brothers expect Joseph to react to them?', array['With indifference', 'With revenge', 'With laughter', 'They expected nothing'], 1, 'They were terrified, expecting Joseph to take revenge.'),
  (p, 3, 'What did Joseph choose instead of revenge?', array['Ignoring them', 'Silence', 'Forgiveness', 'Punishment'], 2, 'Joseph chose to forgive his brothers completely.'),
  (p, 4, 'What did Joseph say God turned their harm into?', array['A way to save many lives', 'A funny story', 'Nothing good', 'A punishment for them'], 0, 'Joseph saw God using their betrayal to save many lives.'),
  (p, 1, 'What does being made in God''s image tell you?', array['You don''t matter', 'You were made on purpose and matter to God', 'You are exactly like an animal', 'Nothing special'], 1, 'It means you were made deliberately and you matter to God.'),
  (p, 1, 'What is the main takeaway from the creation truth?', array['Nothing in creation has meaning', 'You were designed on purpose and matter to God', 'The world made itself', 'Only stars matter to God'], 1, 'This truth''s whole point is that you matter because you were made on purpose.'),
  (p, 2, 'What pattern do Adam and Eve''s choice and Cain''s choice both show?', array['Sin makes you happy forever', 'Sin always leads somewhere real', 'Only adults sin', 'Sin has no effect'], 1, 'Both stories show sin, even small at first, leads to real consequences.'),
  (p, 2, 'Did God walk away after Adam, Eve, and Cain sinned?', array['Yes, completely', 'He disappeared forever', 'No, He kept caring for them', 'He punished them and left'], 2, 'God stayed engaged with them despite their failures.'),
  (p, 3, 'Did God''s promises to Noah and Abraham come true?', array['It''s unclear', 'Only partly', 'No', 'Yes, exactly as He said'], 3, 'Both promises were fulfilled exactly as God had said.'),
  (p, 3, 'What is faith, based on Abraham''s story?', array['Trusting God even when it doesn''t fully make sense yet', 'Only trusting when you understand everything', 'Avoiding hard choices', 'Doing whatever feels easiest'], 0, 'Faith is trusting God''s character even without full understanding.'),
  (p, 4, 'What did Joseph choose to do when he had the power to punish his brothers?', array['Send them away', 'Punish them severely', 'Ignore them forever', 'Forgive them'], 3, 'Joseph chose forgiveness over revenge.'),
  (p, 4, 'What did Joseph see God had done with his brothers'' worst choice?', array['Erased it', 'Used it for something good', 'Made it worse', 'Nothing'], 1, 'Joseph recognized God had used their betrayal for good.'),
  (p, 5, 'Where was God with Jacob and Joseph?', array['Only in good times', 'Nowhere in particular', 'Only at home', 'Everywhere, including the hardest places'], 3, 'God''s presence reached them in every place, even the hardest ones.'),
  (p, 5, 'What does this lesson encourage you to believe about hard places in your own life?', array['This promise doesn''t apply today', 'God avoids hard places', 'Only good places have God''s presence', 'God can be present there too'], 3, 'This lesson encourages trusting that God''s presence reaches every hard place too.');
end
$$;
